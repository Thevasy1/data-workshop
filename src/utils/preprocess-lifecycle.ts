/**
 * 预处理任务生命周期钩子 — AOP 预留接口
 *
 * == 设计意图 ==
 * 当前预处理采用简单状态机 (pending → running → success | failed)，
 * 但为未来支持暂停/恢复保留了完整的钩子系统。
 *
 * == 接入方式 ==
 * 后续开发者只需在 hooks 注册表中添加处理器，即可在对应生命周期
 * 事件触发时获得控制权，无需修改预处理业务代码。
 *
 *   import { preprocessLifecycle } from '@/utils/preprocess-lifecycle'
 *
 *   preprocessLifecycle.on('checkpoint', async (ctx) => {
 *     await saveCheckpointToStorage(ctx)
 *   })
 *
 *   preprocessLifecycle.on('pause', async (ctx) => {
 *     await notifyBackendToPause(ctx.taskId)
 *   })
 *
 * == 后端配合 ==
 * 真正的暂停/恢复执行逻辑在后端。前端钩子负责：
 * 1. 发出暂停/恢复指令
 * 2. 持久化/读取检查点元信息
 * 3. UI 状态同步
 */

/* ========== 类型定义 ========== */

/** 检查点数据 — 记录处理到哪一步了 */
export interface Checkpoint {
    /** 任务 ID */
    taskId: string
    /** 处理方式 */
    processType: 'clean' | 'dedup' | 'normalize' | 'format'
    /** 已处理的行数 */
    processedRows: number
    /** 总行数 */
    totalRows: number
    /** 处理方式特定的中间状态 */
    state: Record<string, unknown>
    /** 检查点创建时间 */
    timestamp: string
}

/** 任务暂停请求 */
export interface PauseRequest {
    taskId: string
    reason?: string
}

/** 任务恢复请求 */
export interface ResumeRequest {
    taskId: string
    checkpointId: string
}

/** 生命周期事件名称 */
export type LifecycleEvent =
    | 'beforeStart'       // 任务启动前
    | 'afterStart'        // 任务启动后
    | 'beforeComplete'    // 任务完成前
    | 'afterComplete'     // 任务完成后
    | 'checkpoint'        // 检查点到达
    | 'pause'             // 暂停请求
    | 'resume'            // 恢复请求
    | 'rollback'          // 回滚请求
    | 'error'             // 出错时

/** 事件上下文 */
export interface LifecycleContext {
    taskId: string
    event: LifecycleEvent
    checkpoint?: Checkpoint
    pauseRequest?: PauseRequest
    resumeRequest?: ResumeRequest
    error?: Error
    metadata?: Record<string, unknown>
}

/** 事件处理器 */
type EventHandler = (ctx: LifecycleContext) => Promise<void> | void

/* ========== 钩子注册表 ========== */

class PreprocessLifecycle {
    private handlers = new Map<LifecycleEvent, Set<EventHandler>>()

    /**
     * 注册生命周期事件处理器
     *
     * @example
     *   preprocessLifecycle.on('checkpoint', async (ctx) => {
     *     console.log(`任务 ${ctx.taskId} 到达检查点: ${ctx.checkpoint?.processedRows}/${ctx.checkpoint?.totalRows}`)
     *   })
     */
    on(event: LifecycleEvent, handler: EventHandler): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set())
        }
        this.handlers.get(event)!.add(handler)
    }

    /**
     * 移除已注册的事件处理器
     */
    off(event: LifecycleEvent, handler: EventHandler): void {
        this.handlers.get(event)?.delete(handler)
    }

    /**
     * 触发生命周期事件 — 执行所有已注册的处理器
     */
    async emit(event: LifecycleEvent, ctx: Partial<LifecycleContext>): Promise<void> {
        const handlers = this.handlers.get(event)
        if (!handlers || handlers.size === 0) return

        const fullCtx: LifecycleContext = {
            taskId: ctx.taskId ?? '',
            event,
            ...ctx,
        }

        const errors: Error[] = []
        for (const handler of handlers) {
            try {
                await handler(fullCtx)
            } catch (err) {
                errors.push(err instanceof Error ? err : new Error(String(err)))
            }
        }

        if (errors.length > 0) {
            throw new AggregateError(errors, `预处理生命周期事件 "${event}" 中有 ${errors.length} 个处理器失败`)
        }
    }

    /**
     * 获取当前注册的事件类型列表（用于调试/检查）
     */
    getRegisteredEvents(): LifecycleEvent[] {
        return Array.from(this.handlers.keys())
    }
}

/** 全局单例 */
export const preprocessLifecycle = new PreprocessLifecycle()

/* ========== 预留：检查点存储接口 ========== */

/**
 * 检查点存储适配器 — 后续可按需实现不同存储后端
 *
 * @example
 *   class LocalStorageCheckpointStore implements CheckpointStore {
 *     async save(cp: Checkpoint) { localStorage.setItem(`cp:${cp.taskId}`, JSON.stringify(cp)) }
 *     async load(taskId: string) { return JSON.parse(localStorage.getItem(`cp:${taskId}`)!) }
 *   }
 */
export interface CheckpointStore {
    save(checkpoint: Checkpoint): Promise<void>
    load(taskId: string): Promise<Checkpoint | null>
    delete(taskId: string): Promise<void>
}

/* ========== 预留：任务轮询基础设施 ========== */

/**
 * 任务状态轮询器 — 当需要暂停/恢复时，前端需定期拉取任务进度。
 * 当前为预留，暂不启用。
 */
export interface TaskPollingConfig {
    taskId: string
    intervalMs: number
    onProgress: (checkpoint: Checkpoint) => void
    onComplete: () => void
    onError: (err: Error) => void
}
