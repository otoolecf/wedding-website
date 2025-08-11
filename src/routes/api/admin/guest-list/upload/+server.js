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
    let insertedCount = 0;
    let updatedCount = 0;
    for (const record of data) {
      try {
        // Check if guest already exists
        const existingGuest = await platform.env.RSVPS.prepare(
          'SELECT * FROM guest_list WHERE name = ?'
        )
          .bind(record.name?.trim())
          .first();

        if (existingGuest) {
          // Update existing guest record
          await platform.env.RSVPS.prepare(
            `
            UPDATE guest_list 
            SET email = ?, partner_name = ?
            WHERE name = ?
            `
          )
            .bind(
              record.email?.trim() || null,
              record.partner_name?.trim() || null,
              record.name?.trim()
            )
            .run();
          updatedCount++;
        } else {
          // Insert new guest record
          await platform.env.RSVPS.prepare(
            `
            INSERT INTO guest_list (
              name,
              email,
              partner_name
            ) VALUES (?, ?, ?)
            `
          )
            .bind(
              record.name?.trim(), 
              record.email?.trim() || null, 
              record.partner_name?.trim() || null
            )
            .run();
          insertedCount++;
        }
      } catch (recordError) {
        console.error('Error processing record:', record, recordError);
        throw new Error(`Failed to process record ${insertedCount + updatedCount + 1}: ${record.name}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted: insertedCount,
        updated: updatedCount,
        total: insertedCount + updatedCount,
        message: `Successfully processed ${insertedCount + updatedCount} records (${insertedCount} new, ${updatedCount} updated)`
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
