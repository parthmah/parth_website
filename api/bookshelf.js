const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Status',
        status: {
          is_not_empty: true
        }
      },
      sorts: [
        {
          property: 'Status',
          direction: 'ascending'
        },
        {
          property: 'Date finished',
          direction: 'descending'
        }
      ]
    });

    const books = response.results.map(book => {
      const properties = book.properties;
      
      return {
        id: book.id,
        title: properties.Title?.title?.[0]?.plain_text || 'Unknown Title',
        author: properties.Author?.rich_text?.[0]?.plain_text || 'Unknown Author',
        url: properties.Link?.url || null,
        coverImage: book.cover?.external?.url || book.cover?.file?.url || null,
        status: properties.Status?.status?.name || 'Unknown',
        summary: properties.Summary?.rich_text?.[0]?.plain_text || '',
        rating: properties.Rating?.select?.name || 'Not yet rated',
        category: properties.Category?.select?.name || '',
        currentPage: properties['Current page']?.number || null,
        totalPages: properties['Total pages']?.number || null,
        dateStarted: properties['Date started']?.date?.start || null,
        dateFinished: properties['Date finished']?.date?.start || null,
        progress: properties.Progress?.formula?.number || null
      };
    });

    // Custom sorting: Reading first, then Completed by date finished descending
    const sortedBooks = books.sort((a, b) => {
      // Reading books first
      if (a.status === 'Reading' && b.status !== 'Reading') return -1;
      if (a.status !== 'Reading' && b.status === 'Reading') return 1;
      
      // For completed books, sort by date finished descending
      if (a.status === 'Completed' && b.status === 'Completed') {
        const dateA = new Date(a.dateFinished || 0);
        const dateB = new Date(b.dateFinished || 0);
        return dateB - dateA;
        }
      
      // For other statuses, maintain alphabetical order
      return a.title.localeCompare(b.title);
    });

    res.status(200).json({
      books: sortedBooks,
      totalBooks: sortedBooks.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching from Notion:', error);
    res.status(500).json({ error: 'Failed to fetch bookshelf data' });
  }
}; 