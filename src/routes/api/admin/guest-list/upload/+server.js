import Papa from 'papaparse';

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
    console.log('CSV content length:', csvText.length);

    const { data, errors } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
      trimValues: true
    });

    if (errors.length > 0) {
      console.error('CSV parsing errors:', errors);
      return new Response(
        JSON.stringify({
          error: 'Failed to parse CSV',
          details: errors.map((e) => e.message).join(', ')
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid records found in CSV' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required columns
    const requiredColumns = ['name'];
    const missingColumns = requiredColumns.filter((col) => !data[0]?.[col]);
    if (missingColumns.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required columns: ${missingColumns.join(', ')}`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Process each record
    let processedCount = 0;
    for (const record of data) {
      try {
        // Insert or update the guest record
        await platform.env.RSVPS.prepare(
          `
          INSERT OR REPLACE INTO guest_list (
            name,
            partner_name
          ) VALUES (?, ?)
          `
        )
          .bind(record.name?.trim(), record.partner_name?.trim() || null)
          .run();
        processedCount++;
      } catch (recordError) {
        console.error('Error processing record:', record, recordError);
        throw new Error(`Failed to process record ${processedCount + 1}: ${record.name}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: processedCount,
        message: `Successfully processed ${processedCount} records`
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
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
