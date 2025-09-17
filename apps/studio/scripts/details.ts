import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-05-15'})
const EVENT_QUERY = `*[
    _type == "event" 
    && defined(headline) 
    && defined(venue) 
    && !defined(details)][0]{
      _id, 
      headline->{ name }, 
      venue->{ name }
}`

type EventDocument = {
  _id: string
  headline: {name: string}
  venue: {name: string}
}

async function run() {
  try {
    const event = await client.fetch<EventDocument>(EVENT_QUERY)

    if (!event) {
      console.log('No events found that need details')
      return
    }

    console.log(`Found event: ${event.headline.name} at ${event.venue.name}`)

    // Create a basic description for the event
    const description = `Join us for an amazing performance by ${event.headline.name} at ${event.venue.name}. This promises to be an unforgettable evening of music and entertainment.`

    // Update the document with the generated description
    const result = await client
      .patch(event._id)
      .set({
        details: [
          {
            _type: 'block',
            _key: 'details-block',
            markDefs: [],
            children: [
              {
                _type: 'span',
                _key: 'details-span',
                text: description,
                marks: [],
              },
            ],
            style: 'normal',
          },
        ],
      })
      .commit()

    console.log('Successfully updated event with details:', description)
    console.log('Updated document ID:', result._id)
  } catch (error) {
    console.error('Error updating event:', error)
  }
}

run()
