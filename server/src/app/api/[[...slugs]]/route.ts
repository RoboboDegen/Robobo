import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger';
// 定义一些接口类型
interface User {
    id: number;
    name: string;
    email: string;
    age?: number;
}

interface CreateUserBody {
    name: string;
    email: string;
    age?: number;
}

interface UpdateUserBody {
    name?: string;
    email?: string;
    age?: number;
}

// 定义路由参数类型
interface RouteParams {
    name: string;
    id: string;
    orgId: string;
    depId: string;
}

// 定义查询参数类型
interface SearchQuery {
    q?: string;
    limit?: string;
    offset?: string;
}

// 添加通配符参数类型
interface WildcardParams {
    '*': string;
}

// 模拟用户数据
const users: User[] = [
    { id: 1, name: "张三", email: "zhangsan@example.com", age: 25 },
    { id: 2, name: "李四", email: "lisi@example.com", age: 30 }
];

// 模拟数据
const mockProjects = [
    { id: "1", accountId: "project1", name: "Project 1" },
    { id: "2", accountId: "project2", name: "Project 2" }
];

const mockPots = [
    { 
        id: "pot1",
        name: "Pot 1",
        isRoundLive: true,
        project: ["project1", "project2"]
    }
];

// 模拟搜索函数
async function searchProject(projectId: string) {
    return mockProjects.filter(p => p.id === projectId || p.accountId === projectId);
}

async function searchPot(potId: string) {
    return mockPots.filter(p => p.id === potId);
}

interface Params {
    projectId: string;
    potId: string;
    quantity: string;
}

const app = new Elysia({ prefix: '/api', aot: false })
    .use(
        swagger({
            documentation: {
                info: {
                    title: 'Robobo Server Api Documentation',
                    version: '1.0.0'
                }
            }
        })
    )
    .get('/', ()=>'Hello Elysia')
    // 1. 基础GET请求 - 查询参数示例
    .get("/hello", () => {
        return { message: "Hello, World!" };
    })
    .get("/hello/:name", ({ params: { name } }: { params: Pick<RouteParams, 'name'> }) => {
        return { message: `Hello, ${name}!` };
    })
    // 2. 查询参数示例
    .get("/search", ({ query }: { query: SearchQuery }) => {
        const { q, limit = "10", offset = "0" } = query;
        return {
            query: q,
            limit: parseInt(limit),
            offset: parseInt(offset),
            timestamp: new Date()
        };
    })

    // 3. POST请求 - 创建资源示例
    .post("/users", async ({ body }: { body: CreateUserBody }) => {
        const newUser: User = {
            id: users.length + 1,
            ...body
        };
        console.log(newUser)
        users.push(newUser);
        return { status: "success", data: newUser };
    })

    // 4. PUT请求 - 更新资源示例
    .put("/users/:id", async ({ params: { id }, body }: { params: Pick<RouteParams, 'id'>, body: UpdateUserBody }) => {
        const userIndex = users.findIndex(u => u.id === parseInt(id));
        if (userIndex === -1) {
            return { error: "User not found" };
        }
        users[userIndex] = { ...users[userIndex], ...body };
        return { status: "success", data: users[userIndex] };
    })

    // 5. DELETE请求示例
    .delete("/users/:id", ({ params: { id } }: { params: Pick<RouteParams, 'id'> }) => {
        const userIndex = users.findIndex(u => u.id === parseInt(id));
        if (userIndex === -1) {
            return { error: "User not found" };
        }
        const deletedUser = users.splice(userIndex, 1)[0];
        return { status: "success", data: deletedUser };
    })

    // 6. 组合查询参数和路径参数
    .get("/users/:id/posts", ({ params: { id }, query }: { params: Pick<RouteParams, 'id'>, query: SearchQuery }) => {
        const { limit = "5", offset = "0" } = query;
        return {
            userId: parseInt(id),
            limit: parseInt(limit),
            offset: parseInt(offset),
            posts: [`Post 1 for user ${id}`, `Post 2 for user ${id}`]
        };
    })

    // 7. 错误处理示例
    .get("/error-test", () => {
        throw new Error("This is a test error");
    })
    .post('/upload', ({ body }) => {
        const { file } = body;
        // 处理单个文件
        if (file && file instanceof Blob) {
            console.log('Single file uploaded:', file.name);
            // 保存文件或上传到云存储
        }
        // 返回成功响应
        return {
            message: 'Files uploaded successfully',
            singleFile: file ? file.name : null,
        };
    }, {
        body: t.Object({
            file: t.File(), // 单个文件
        })
    })
    // 9. PATCH请求 - 部分更新示例
    .patch("/users/:id/email", async ({ params: { id }, body }: { params: Pick<RouteParams, 'id'>, body: { email: string } }) => {
        const userIndex = users.findIndex(u => u.id === parseInt(id));
        if (userIndex === -1) {
            return { error: "User not found" };
        }
        users[userIndex].email = body.email;
        return { status: "success", data: users[userIndex] };
    })

    // 10. 嵌套路由参数示例
    .get("/organizations/:orgId/departments/:depId/employees", ({ params: { orgId, depId } }: { params: Pick<RouteParams, 'orgId' | 'depId'> }) => {
        return {
            organization: orgId,
            department: depId,
            employees: ["Employee 1", "Employee 2"]
        };
    })

    // 原有的接口保持不变
    .get("/project/:projectId", async ({ params: { projectId } }: { params: Pick<Params, 'projectId'> }) => {
        const projects = await searchProject(projectId);
        return projects[0] || { error: "Project not found" };
    })
    .get("/pot/:potId", async ({ params: { potId } }: { params: Pick<Params, 'potId'> }) => {
        const pots = await searchPot(potId);
        return pots[0] || { error: "Pot not found" };
    })
    .get("/donate/:projectId/:quantity", async ({ params: { projectId, quantity } }: { params: Pick<Params, 'projectId' | 'quantity'> }) => {
        if (parseFloat(quantity) < 0.1) {
            return { error: "Amount donate have to > 0.1" };
        }
        const projects = await searchProject(projectId);
        if (projects.length === 0) {
            return { error: "Project not found" };
        }
        
        return projects.map((project) => ({
            receiverId: "donate.potlock",
            functionCalls: [{
                methodName: "donate",
                args: {
                    recipient_id: project.accountId,
                    bypass_protocol_fee: false,
                    message: "Donate from mintbase wallet",
                },
                gas: "300000000000000",
                amount: quantity
            }]
        }));
    })
    .get("/donate/pot/:potId/:projectId/:quantity", async ({ params: { potId, projectId, quantity } }: { params: Pick<Params, 'potId' | 'projectId' | 'quantity'> }) => {
        if (parseFloat(quantity) < 0.1) {
            return { error: "Amount donate have to > 0.1" };
        }
        const pots = await searchPot(potId);
        if (pots.length === 0) {
            return { error: "Pot not found" };
        }

        const potsIsNotRoundLive = pots.filter(pot => !pot.isRoundLive);
        if (potsIsNotRoundLive.length > 0) {
            const potsIsNotRoundLiveArray = potsIsNotRoundLive.map(pot => pot.name);
            return { error: `Pot ${potsIsNotRoundLiveArray.join(", ")} not live` };
        }

        const projects = await searchProject(projectId);
        if (projects.length === 0) {
            return { error: "Project not found" };
        }

        const projectIds = projects.map(project => project.accountId);
        const validPots = pots.map(pot => ({
            id: pot.id,
            validProjects: pot.project.filter(p => projectIds.includes(p))
        })).filter(p => p.validProjects.length > 0);

        if (validPots.length === 0) {
            return { error: "No matching projects found in the pot" };
        }

        return validPots.flatMap(pot => 
            pot.validProjects.map(projectId => ({
                receiverId: pot.id,
                functionCalls: [{
                    methodName: "donate",
                    args: {
                        project_id: projectId,
                        bypass_protocol_fee: false,
                        message: "Donate from mintbase wallet",
                    },
                    gas: "300000000000000",
                    amount: quantity
                }]
            }))
        );
    })

    // 11. 通配符路由示例
    .get('/files/*', ({ params }: { params: WildcardParams }) => {
        return {
            path: params['*'],
            message: '匹配任意路径'
        };
    })

    // 12. 可选参数示例
    .get('/optional/:name?', ({ params: { name } }: { params: Partial<Pick<RouteParams, 'name'>> }) => {
        return {
            message: name ? `Hello, ${name}!` : 'Hello, Guest!'
        };
    })

    // 13. 路由分组示例
    .group('/admin', app => app
        .get('/stats', () => ({
            users: users.length,
            message: '管理员统计信息'
        }))
        .post('/reset', () => {
            users.length = 0;
            return { message: '已重置所有数据' };
        })
    )

    // 14. 所有方法示例
    .all('/ping', () => ({
        message: 'pong',
        method: 'supports all HTTP methods'
    }))
    .compile();

// 只导出 Next.js 支持的标准 HTTP 方法
export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const PATCH = app.handle;
export const DELETE = app.handle;
export const HEAD = app.handle;
export const OPTIONS = app.handle;