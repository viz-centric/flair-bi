export const name = 'Constraints';
export function Constraints($resource) {
    var resourceUrl = "api/constraints/:id";

    return $resource(
        resourceUrl,
        {},
        {
            query: {
                method: "GET",
                isArray: true
            }
        }
    );
}