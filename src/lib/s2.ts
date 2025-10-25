// Real S2.dev implementation
// Uses the S2.dev REST API with the lecture-pulse basin

interface StreamRecord {
  [key: string]: any;
}

interface S2Stream {
  append: (record: StreamRecord) => Promise<void>;
  read: (options?: { limit?: number }) => Promise<StreamRecord[]>;
}

interface S2Basin {
  stream: (streamId: string) => S2Stream;
}

interface S2Client {
  basin: (basinName: string) => S2Basin;
}

class S2Implementation implements S2Client {
  private static instance: S2Implementation;
  private authToken: string;
  private baseUrl = 'https://lecture-pulse.b.aws.s2.dev/v1';

  constructor() {
    this.authToken = process.env.S2_ACCESS_TOKEN || '';
    if (!this.authToken) {
      throw new Error('S2_ACCESS_TOKEN environment variable is required');
    }
  }

  // Singleton pattern to ensure single instance
  static getInstance(): S2Implementation {
    if (!S2Implementation.instance) {
      S2Implementation.instance = new S2Implementation();
    }
    return S2Implementation.instance;
  }

  basin(basinName: string): S2Basin {
    return {
      stream: (streamId: string) => {
        return {
          append: async (record: StreamRecord) => {
            try {
              const response = await fetch(`${this.baseUrl}/streams/${streamId}/records`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${this.authToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  records: [{
                    body: JSON.stringify(record),
                    headers: [],
                    timestamp: null
                  }]
                })
              });

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`S2 append failed: ${response.status} ${response.statusText} - ${errorText}`);
              }

              const result = await response.json();
              console.log(`📝 Appended record to ${streamId}:`, record);
              console.log(`📊 S2 append result:`, result);
            } catch (error) {
              console.error(`❌ Failed to append to ${streamId}:`, error);
              throw error;
            }
          },

          read: async (options?: { limit?: number }) => {
            try {
              let url = `${this.baseUrl}/streams/${streamId}/records?seq_num=0`;
              if (options?.limit) {
                url += `&count=${options.limit}`;
              }

              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${this.authToken}`,
                  'Content-Type': 'application/json',
                }
              });

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`S2 read failed: ${response.status} ${response.statusText} - ${errorText}`);
              }

              const result = await response.json();
              const records = result.records?.map((r: any) => {
                try {
                  return JSON.parse(r.body);
                } catch {
                  return { body: r.body };
                }
              }) || [];

              console.log(`📖 Reading from ${streamId}: ${records.length} records found`);
              return records;
            } catch (error) {
              console.error(`❌ Failed to read from ${streamId}:`, error);
              throw error;
            }
          }
        };
      }
    };
  }

  // Debug method to list streams (if needed)
  async listStreams() {
    try {
      const response = await fetch(`${this.baseUrl}/streams`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to list streams: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to list streams:', error);
      throw error;
    }
  }
}

if (!process.env.S2_ACCESS_TOKEN) {
  console.error("❌ S2_ACCESS_TOKEN environment variable is required for S2.dev integration");
}

export const s2 = S2Implementation.getInstance();

// NOTE: Using the actual basin name 'lecture-pulse' as created in S2.dev
export const basin = s2.basin("lecture-pulse");