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

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAniListCharacter(
  characterName: string,
): Promise<AniListCharacter> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(
        process.env.ANILIST_API_URL ?? "https://graphql.anilist.co",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent":
              "JargonNoJutsu/1.0 (+https://github.com/ausafelahi/jargon-no-jutsu)",
          },
          body: JSON.stringify({
            query: CHARACTER_QUERY,
            variables: { search: characterName },
          }),
        },
      );

      if (!res.ok) {
        const bodyText = await res.text().catch(() => "<no body>");
        throw new Error(
          `AniList request failed for "${characterName}": ${res.status} ${res.statusText} — ${bodyText.slice(0, 300)}`,
        );
      }

      const json = (await res.json()) as AniListResponse;

      if (json.errors?.length) {
        throw new Error(
          `AniList error for "${characterName}": ${json.errors.map((e) => e.message).join("; ")}`,
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
    } catch (err) {
      lastError = err;

      const isNotFound =
        err instanceof Error && err.message.includes("not found");
      if (isNotFound || attempt === MAX_ATTEMPTS) {
        throw lastError;
      }

      console.warn(
        `AniList fetch attempt ${attempt}/${MAX_ATTEMPTS} failed for "${characterName}", retrying in ${RETRY_DELAY_MS}ms:`,
        err instanceof Error ? err.message : err,
      );
      await sleep(RETRY_DELAY_MS);
    }
  }

  throw lastError;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}
