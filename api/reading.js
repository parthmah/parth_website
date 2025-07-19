import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Status',
        status: {
          equals: 'Reading'
        }
      },
      page_size: 1
    });

    if (response.results.length === 0) {
      return res.status(404).json({ error: 'No book currently being read' });
    }

    const book = response.results[0];
    const properties = book.properties;

    // Extract book details from Notion properties
    const title = properties.Title?.title?.[0]?.plain_text || 'Unknown Title';
    const author = properties.Author?.rich_text?.[0]?.plain_text || 'Unknown Author';
    const url = properties.Link?.url || null;
    const coverImage = book.cover?.external?.url || book.cover?.file?.url || null;

    const bookData = {
      title,
      author,
      url,
      coverImage,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(bookData);
  } catch (error) {
    console.error('Error fetching from Notion:', error);
    res.status(500).json({ error: 'Failed to fetch reading data' });
  }
} 