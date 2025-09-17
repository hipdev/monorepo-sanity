import {CalendarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'
import {DoorsOpenInput} from './components/DoorsOpenInput'

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  groups: [
    {
      name: 'details',
      title: 'Details',
    },
    {
      name: 'editorial',
      title: 'Editorial',
    },
  ],
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'name',
      },
      validation: (rule) => rule.required().error('You must provide a slug' as string),
      hidden: ({document}) => !document?.name,
      readOnly: ({value, currentUser}) => {
        // Anyone can set the initial slug
        if (!value) {
          return false
        }

        const isAdmin = currentUser?.roles.some((role) => role.name === 'administrator')

        // Only admins can change the slug
        return !isAdmin
      },
      group: 'details',
    }),
    defineField({
      name: 'eventType',
      type: 'string',
      deprecated: {
        reason: 'Use the "Event format" field instead.',
      },
      readOnly: true,
      options: {
        list: ['in-person', 'virtual'],
        layout: 'radio',
      },
      group: 'details',
    }),

    defineField({
      name: 'format',
      type: 'string',
      options: {
        list: ['in-person', 'virtual'],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'date',
      type: 'datetime',
      group: 'details',
    }),
    defineField({
      name: 'doorsOpen',
      type: 'number',
      initialValue: 60,
      description: 'Number of minutes before the event starts that doors will open',
      group: 'details',
      components: {
        input: DoorsOpenInput,
      },
    }),
    defineField({
      name: 'venue',
      type: 'reference',
      to: [{type: 'venue'}],
      validation: (rule) =>
        rule.custom((value, context) => {
          if (value && context?.document?.eventType === 'virtual') {
            return 'Only in-person events can have a venue'
          }
          return true
        }),
      readOnly: ({value, document}) => !value && document?.eventType === 'virtual',
      group: 'details',
    }),
    defineField({
      name: 'headline',
      type: 'reference',
      to: [{type: 'artist'}],
      group: 'editorial',
    }),
    defineField({
      name: 'image',
      type: 'image',
      group: 'editorial',
    }),
    defineField({
      name: 'details',
      type: 'array',
      of: [{type: 'block'}],
      group: 'editorial',
    }),
    defineField({
      name: 'tickets',
      type: 'url',
      group: 'editorial',
    }),
    defineField({
      name: 'firstPublished',
      description: 'Automatically set when first published',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      name: 'name',
      venue: 'venue.name',
      artist: 'headline.name',
      date: 'date',
      image: 'image',
    },
    prepare({name, venue, artist, date, image}) {
      const nameFormatted = name || 'Untitled event'
      const dateFormatted = date
        ? new Date(date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          })
        : ''

      return {
        title: artist ? `${nameFormatted} (${artist})` : nameFormatted,
        subtitle: venue ? `${dateFormatted} @ ${venue}` : dateFormatted,
        media: image || CalendarIcon,
      }
    },
  },
})
