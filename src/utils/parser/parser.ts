import { Handler, HandlerOptions, registerHandlers } from "./handlers";

export interface ParserResult {
    title: string;
    year: string;
    season?: string;
    episode?: string;
}

export type HandlerFunction = Function;

  
function extendOptions(options: HandlerOptions = {}) {
    const defaultOptions = {
        skipIfAlreadyFound: true,
        type: "string",
    };

    options.skipIfAlreadyFound = options.skipIfAlreadyFound || defaultOptions.skipIfAlreadyFound;
    options.type = options.type || defaultOptions.type;

    return options;
}

function createHandlerFromRegExp(name: string, regExp: RegExp, options: HandlerOptions) {
    let transformer: (input: any) => void;

    if (!options.type) {
        transformer = (input: string) => input;
    } else if (options.type.toLowerCase() === "lowercase") {
        transformer = (input: string) => input.toLowerCase();
    } else if (options.type.toLowerCase().slice(0, 4) === "bool") {
        transformer = () => true;
    } else if (options.type.toLowerCase().slice(0, 3) === "int") {
        transformer = (input: string) => parseInt(input, 10);
    } else {
        transformer = (input: string) => input;
    }

    function handler({ title, result }: { title: string, result: any }) {
        if (result[name] && options.skipIfAlreadyFound) {
            return null;
        }

        const match = title.match(regExp);
        const [rawMatch, cleanMatch] = match || [];

        if (rawMatch && match !== null) {
            result[name] = options.value || transformer(cleanMatch || rawMatch);
            return match.index;
        }

        return null;
    }

    handler.handlerName = name;

    return handler;
}

function cleanTitle(rawTitle: string) {
    let cleanedTitle = rawTitle;

    if (cleanedTitle.indexOf(" ") === -1 && cleanedTitle.indexOf(".") !== -1) {
        cleanedTitle = cleanedTitle.replace(/\./g, " ");
    }

    cleanedTitle = cleanedTitle.replace(/_/g, " ");
    cleanedTitle = cleanedTitle.replace(/([(_]|- )$/, "").trim();

    return cleanedTitle;
}


/**
 * Title parser
 */
export class Parser {
    private handlers: Handler[] = [];

    addHandler(handlerName: string, handler: RegExp | HandlerFunction, options: HandlerOptions = {}) {
        if (typeof handlerName === "string" && handler instanceof RegExp) {

            // If the handler provided is a regular expression
            options = extendOptions(options);
            handler = createHandlerFromRegExp(handlerName, handler, options);

        } else if (typeof handler !== 'function') {

            // If the handler is neither a function nor a regular expression, throw an error
            throw new Error(`Handler for ${handlerName} should be a RegExp or a function. Got: ${typeof handler}`);

        }

        this.handlers.push({
            group: handlerName,
            test: handler as Function,
        });
    }

    parse(title: string): ParserResult {
        const result: any = {};
        let endOfTitle = title.length;

        for (const handler of this.handlers) {
            const matchIndex = handler.test({ title, result });

            if (matchIndex && matchIndex < endOfTitle) {
                endOfTitle = matchIndex;
            }
        }

        result.title = cleanTitle(title.slice(0, endOfTitle));

        return result;
}
}

export const ParserInstance: Parser = (() => { 
    const parser = new Parser();
    registerHandlers(parser);
    return parser;
})();