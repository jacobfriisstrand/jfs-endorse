export async function fetchData<T>(query: string): Promise<T> {
  const response = await fetch("https://graphql.datocms.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${import.meta.env.PUBLIC_DATO_CMS_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });

  const json = await response.json();
  return json.data;
}
