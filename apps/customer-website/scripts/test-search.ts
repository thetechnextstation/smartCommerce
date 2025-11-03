/**
 * Test Semantic Search
 * Quick script to test if semantic search is working
 */

async function testSearch() {
  console.log('🧪 Testing Semantic Search...\n');

  const testQueries = [
    'smartphone',
    'phone',
    'mobile device',
    'samsung',
  ];

  for (const query of testQueries) {
    console.log(`\n📝 Testing query: "${query}"`);
    console.log('─'.repeat(50));

    try {
      const response = await fetch(`http://localhost:3003/api/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        console.error(`❌ Error: ${response.status} ${response.statusText}`);
        const error = await response.text();
        console.error('Response:', error);
        continue;
      }

      const data = await response.json();

      console.log(`✅ Search Type: ${data.searchType}`);
      console.log(`📦 Found ${data.products?.length || 0} products`);

      if (data.products && data.products.length > 0) {
        console.log('\nTop 3 Results:');
        data.products.slice(0, 3).forEach((product: any, index: number) => {
          console.log(`${index + 1}. ${product.name}`);
          if (product.similarity !== undefined) {
            console.log(`   Similarity: ${product.similarity.toFixed(4)}`);
          }
          console.log(`   Price: $${product.price}`);
        });
      }
    } catch (error) {
      console.error('❌ Request failed:', error);
    }
  }

  console.log('\n\n✅ Test completed!');
}

testSearch().catch(console.error);
