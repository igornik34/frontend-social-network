export class AuthRouter {
    static baseRoute = '/auth'

    static routes = {
        login: `${this.baseRoute}/login`,
        register: `${this.baseRoute}/register`,
    }
}