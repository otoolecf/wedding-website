import { parse } from 'csv-parse/sync';

export async function POST({ request, platform }) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Read and parse the CSV file
    const csvText = await file.text();
    console.log('CSV Text:', csvText); // Debug log

    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      skipRecordsWithError: true
    });

    console.log('Parsed Records:', records); // Debug log

    if (!records || records.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid records found in CSV' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required columns
    const requiredColumns = ['name'];
    const missingColumns = requiredColumns.filter((col) => !records[0]?.[col]);
    if (missingColumns.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required columns: ${missingColumns.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process each record
    for (const record of records) {
      try {
        // Insert or update the guest record
        const result = await platform.env.RSVPS.prepare(
          `
          INSERT OR REPLACE INTO guest_list (
            name,
            partner_name
          ) VALUES (?, ?)
          `
        )
          .bind(record.name, record.partner_name || null)
          .run();

        console.log('Insert result:', result); // Debug log
      } catch (recordError) {
        console.error('Error processing record:', record, recordError);
        throw new Error(`Failed to process record: ${record.name}`);
      }
    }

    return new Response(JSON.stringify({ success: true, count: records.length }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing CSV:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process CSV file',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
