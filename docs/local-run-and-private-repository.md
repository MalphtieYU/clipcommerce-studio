# 本地运行与私有仓库

首次运行：

1. 执行 npm.cmd install。
2. 执行 npm.cmd run db:setup，生成本机 SQLite 架构和匿名演示数据。
3. 执行 npm.cmd run dev。
4. 打开 http://127.0.0.1:5173。

本项目没有登录页或演示账号；数据仅保存在本机 SQLite 文件。前端固定为 5173 端口，API 仅监听 127.0.0.1:8787。停止服务时在启动它的终端按 Ctrl+C。

package.json 已声明为私有包。要在 GitHub Desktop 发布时，选择 Repository → Publish repository，并勾选 Keep this code private。当前本地仓库没有 remote，因此本次不会自动推送。

不得提交真实素材、公司数据、导出文件、数据库文件、.env 或密钥。提交前请运行 git status 并确认只包含代码、匿名种子和文档。
