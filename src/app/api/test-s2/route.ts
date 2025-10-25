import { NextResponse } from 'next/server';
import { basin } from '@/lib/s2';

export async function GET() {
  try {
    // Test basic S2 operations
    const testStreamId = 'test-stream-' + Date.now();

    console.log('🧪 Testing S2.dev integration...');
    console.log('📝 Test stream ID:', testStreamId);

    // Test append operation
    const testRecord = {
      type: 'test',
      message: 'Hello from S2.dev!',
      timestamp: new Date().toISOString()
    };

    await basin.stream(testStreamId).append(testRecord);
    console.log('✅ Append operation successful');

    // Test read operation
    const records = await basin.stream(testStreamId).read({ limit: 10 });
    console.log('✅ Read operation successful, records:', records.length);

    return NextResponse.json({
      success: true,
      message: 'S2.dev integration test completed successfully',
      data: {
        testStreamId,
        testRecord,
        recordsFound: records.length,
        records
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ S2.dev integration test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'S2.dev integration test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        authTokenSet: !!process.env.S2_ACCESS_TOKEN
      },
      { status: 500 }
    );
  }
}