export default async function (app) {
    app.addHook("preHandler", async (req, reply) => {
        const sessionId = req.cookies[app.lucia.sessionCookieName];
        if (!sessionId) {
            return reply.status(401).send({ error: "Unauthorized" });
        }
        const { session, user } = await app.lucia.validateSession(sessionId);
        if (!session) {
            reply.clearCookie(app.lucia.sessionCookieName);
            return reply.status(401).send({ error: "Unauthorized" });
        }
        req.user = user;
        req.session = session;
    });
    app.get("/me", async (req) => {
        return { user: req.user };
    });
    app.post("/logout", async (req, reply) => {
        await app.lucia.invalidateSession(req.session.id);
        const sessionCookie = app.lucia.createBlankSessionCookie();
        reply.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        return { success: true };
    });
}
