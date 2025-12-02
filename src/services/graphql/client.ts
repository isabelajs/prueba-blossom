/**
 * Cliente GraphQL genérico y reutilizable
 * Puede ser usado por cualquier service que necesite hacer requests GraphQL
 */

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown[]; path?: unknown[] }>;
}

export class GraphQLClient {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Ejecuta una query/mutation GraphQL
   */
  async request<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const json: GraphQLResponse<T> = await response.json();

      if (json.errors && json.errors.length > 0) {
        const errorMessages = json.errors.map((e) => e.message).join(", ");
        throw new Error(`GraphQL errors: ${errorMessages}`);
      }

      if (!json.data) {
        throw new Error("GraphQL response has no data");
      }

      return json.data;
    } catch (error) {
      console.error("GraphQL request error:", error);
      throw error;
    }
  }
}

// Cliente para Rick and Morty API
export const rickAndMortyClient = new GraphQLClient(
  "https://rickandmortyapi.com/graphql"
);
