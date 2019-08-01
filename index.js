const fastify = require('fastify')({
    logger: true
})

const fetch = require('node-fetch');
const merge = require('@jacobmischka/ical-merger')

const path = require('path')

fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public')
})

fastify.route({
    method: 'GET',
    url: "/aggregate",
    handler: async (request, reply) => {
        let query = request.query
        if (query.cal) {
            let cals = query.cal.split(",");
            cals = await Promise.all(cals.map(url => fetch(url).then(r => r.text())));

            reply.header('Expires', 'Mon, 01 Jan 1990 00:00:00 GMT');
            reply.header('Date', new Date().toGMTString());
            reply.header('Content-Type', 'text/calendar; charset=UTF-8');
            reply.header('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
            reply.header('Pragma', 'no-cache');

            reply.send(merge(cals))
            return
        }
        
        reply.code(500);
        reply.send("An error occured")

    }
})

fastify.listen(3000, (err) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
})