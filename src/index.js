/* leny/gadmwaye
 *
 * /src/index.js - Main entrypoint
 *
 * coded by leny@BeCode
 * started at 17/05/2019
 */

import {createError} from "micro";
import parseurl from "parseurl";
import {parse as parseqs} from "qs";
import {post} from "got";

export default async (request, response) => {
    const {method} = request;

    if (method !== "GET") {
        throw createError(405, "Method Not Allowed");
    }

    const {pathname, query} = parseurl(request);
    const {redirect_uri, state, domain = "github.com"} = parseqs(query);
    const [, client, code] = pathname.split("/");

    const secret = process.env[client];

    if (!secret) {
        throw createError(500, `Client ID "${client}" isn't configured!`);
    }

    const opts = {
        body: {
            client_id: client,
            client_secret: secret,
            code,
        },
        json: true,
    };

    if (redirect_uri) {
        opts.body.redirect_uri = redirect_uri;
    }
    if (state) {
        opts.body.state = state;
    }

    const {error, body} = await post(
        `https://${domain}/login/oauth/access_token`,
        opts,
    );

    if (error) {
        throw new Error(error);
    }

    response.end(body);
};
