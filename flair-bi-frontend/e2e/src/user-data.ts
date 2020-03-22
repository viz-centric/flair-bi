class UserData {
    admin: User;
    user: User;
    wrongUser: User;

    constructor(admin: User, user: User, wrongUser: User) {
        this.admin = admin;
        this.user = user;
        this.wrongUser = wrongUser;
    }
}

export class User {
    username: string;
    password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}


export let userData = new UserData(
    new User('flairadmin', 'admin'),
    new User('user', 'user'),
    new User('afasfa', 'asdasfas')
);