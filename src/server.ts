import express from "express"

export default class Server {
    public static app: express.Application;

    public static initialize() {
        const app = this.app = express();
        const port = 3000;

        app.use(express.static(__dirname + '/../public'));

        app.listen(port, () => {
            console.log(`Express listening http://localhost:${port}`)
        })
    }
}