import { SearchServiceClient } from '@google-cloud/discoveryengine';

/**
 * Verifies if the Vertex AI Search (Discovery Engine) index is ready for queries.
 */
async function verifyIndex() {
  const projectId = process.env.DISCOVERY_ENGINE_PROJECT_ID || process.env.GCP_PROJECT_ID || '<your-gcp-project>';
  const location = process.env.DISCOVERY_ENGINE_LOCATION || 'global';
  const collectionId = process.env.DISCOVERY_ENGINE_COLLECTION || 'default_collection';
  const engineId = process.env.DISCOVERY_ENGINE_ENGINE_ID || '<your-engine-id>';
  const servingConfigId = process.env.DISCOVERY_ENGINE_SERVING_CONFIG || 'default_serving_config';

  const client = new SearchServiceClient();

  // Construct the serving config path
  const servingConfig = `projects/${projectId}/locations/${location}/collections/${collectionId}/engines/${engineId}/servingConfigs/${servingConfigId}`;

  console.log(`🔍 Checking index status for: ${engineId}...`);
  console.log(`📍 Path: ${servingConfig}`);

  try {
    const request = {
      servingConfig,
      query: 'deep learning', // A generic query to test the index
      pageSize: 5,
    };

    const [response] = await client.search(request);

    if (response && response.results) {
      console.log('✅ Index is ACTIVE and returning results!');
      console.log(`📄 Results found: ${response.totalSize}`);
      
      response.results.forEach((result: any, index: number) => {
        console.log(`\n[${index + 1}] ${result.document.derivedStructData?.title || 'No Title'}`);
        console.log(`🔗 URL: ${result.document.derivedStructData?.link || 'No Link'}`);
      });
    } else {
      console.log('⚠️ Index is active but returned 0 results. It might still be crawling.');
    }
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('indexer is not ready')) {
      console.log('⏳ Index is still being built or crawled. This can take 30-60 minutes.');
      console.log(`Original Error: ${error.message}`);
    } else {
      console.error('❌ Error querying Discovery Engine:', error.message);
      if (error.details) console.error('Details:', error.details);
    }
  }
}

verifyIndex();
