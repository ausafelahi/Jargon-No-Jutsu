const CHARACTER_QUERY = `
query ($search: String) {
  Character(search: $search) {
    id
    name {
      full
    }
    image {
      large
    }
    description(asHtml: false)
    media(perPage: 1, sort: POPULARITY_DESC) {
      nodes {
        title {
          romaji
          english
        }
      }
    }
  }
}
`;

export interface AniListCharacter {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  animeTitle: string;
}

interface AniListResponse {
  data: {
    Character: {
      id: number;
      name: { full: string };
      image: { large: string };
      description: string | null;
      media: { nodes: { title: { romaji: string; english: string | null } }[] };
    } | null;
  };
  errors?: { message: string }[];
}

export async function fetchAniListCharacter(
  characterName: string,
): Promise<AniListCharacter> {
  const res = await fetch(
    process.env.ANILIST_API_URL ?? "https://graphql.anilist.co",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: CHARACTER_QUERY,
        variables: { search: characterName },
      }),
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) {
    throw new Error(`AniList request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as AniListResponse;

  if (json.errors?.length) {
    throw new Error(
      `AniList error: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }

  const character = json.data.Character;
  if (!character) {
    throw new Error(`AniList: character "${characterName}" not found`);
  }

  const media = character.media.nodes[0]?.title;
  const animeTitle = media?.english ?? media?.romaji ?? "Unknown";

  return {
    id: character.id,
    name: character.name.full,
    imageUrl: character.image.large,
    description: stripHtml(character.description ?? ""),
    animeTitle,
  };
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}
