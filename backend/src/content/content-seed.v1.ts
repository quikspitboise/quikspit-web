// Immutable initial content for migration 1791763200000. Future defaults belong in a new migration.
import type { ContentKind, ContentValue } from './dto/content.dto';

export const INITIAL_CONTENT_V1: {
  key: string;
  kind: ContentKind;
  value: ContentValue;
}[] = [
  {
    key: 'site',
    kind: 'site',
    value: {
      schemaVersion: 1,
      business: {
        name: 'QuikSpit Auto Detailing',
        phone: '+12089604970',
        phoneDisplay: '(208) 960-4970',
        email: 'contact@quikspitboise.com',
        serviceArea: 'A private garage in the Boise area.',
        hours: 'By appointment. Same-day slots when open.',
        locationNote: 'The address comes with your booking confirmation.',
      },
      navigation: [
        {
          label: 'Pricing',
          href: '/pricing',
        },
        {
          label: 'Gallery',
          href: '/gallery',
        },
        {
          label: 'About',
          href: '/about',
        },
        {
          label: 'Contact',
          href: '/contact',
        },
      ],
      footerLinks: [
        {
          label: 'Pricing',
          href: '/pricing',
        },
        {
          label: 'Book a detail',
          href: '/booking#design-your-detail',
        },
        {
          label: 'Gallery',
          href: '/gallery',
        },
        {
          label: 'About',
          href: '/about',
        },
        {
          label: 'Contact',
          href: '/contact',
        },
      ],
      socialLinks: [
        {
          label: 'Instagram',
          href: 'https://www.instagram.com/quikspitboise/',
        },
        {
          label: 'TikTok',
          href: 'https://www.tiktok.com/@quikspitboise',
        },
        {
          label: 'Facebook',
          href: 'https://www.facebook.com/people/QuikSpit-Auto-Detailing/61577268493375/',
        },
      ],
      bookingLink: {
        label: 'Book a detail',
        href: '/booking#design-your-detail',
      },
      metadata: {
        title: 'QuikSpit Auto Detailing - Professional Car Detailing',
        description:
          'Professional car detailing services that make your vehicle shine like new. Experience the difference with our premium cleaning and protection services.',
        socialImageUrl: '/hero_fallback.jpg',
      },
      copy: {
        seo: {
          keywords: ['car detailing', 'auto detailing', 'car wash', 'vehicle cleaning', 'paint protection', 'ceramic coating', 'Boise car detailing'],
        },
        skipToContent: 'Skip to content',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        footerDescription:
          'Car detailing by appointment in a private Boise-area garage.',
        footerPagesHeading: 'Pages',
        footerContactHeading: 'Contact',
        footerContactNote: 'Call or text any day. We reply within a day.',
        copyright: 'QuikSpit Auto Detailing, Boise, Idaho',
        reviews: {
          heading: 'Google reviews',
          unavailable: 'Reviews could not be loaded here.',
          readLabel: 'Read them on Google',
          fallbackUrl:
            'https://www.google.com/search?q=QuikSpit+Auto+Detailing+Boise',
          leaveLabel: 'Leave a review',
        },
        scheduling: {
          loading: 'Loading the calendar…',
          failed: 'The booking calendar could not load.',
          openLabel: 'Open scheduling on Cal.com',
        },
      },
    },
  },
  {
    key: 'catalog',
    kind: 'catalog',
    value: {
      schemaVersion: 1,
      currency: 'USD',
      calUsername: 'quikspitboise',
      categories: [
        {
          id: 'combo',
          label: 'Exterior + Interior',
          blurb: 'The whole car, inside and out.',
          enabled: true,
          calEventSlug: 'full-detail',
          packages: [
            {
              id: 'silver',
              name: 'Silver Package',
              tagline: 'The Essentials',
              description:
                'A sleek entry level option that still feels exclusive.',
              features: [
                'Full interior vacuum including trunk',
                'Scrub/Wipe all interior surfaces including door jambs',
                'Stain spot treatment',
                'Streak-free glass clean',
                'Professional hand wash of all exterior surfaces',
                'Deep clean rims and tires',
                'Tire shine applied',
                '3 month ceramic sealant applied',
              ],
              basePriceCents: 20000,
              enabled: true,
              highlight: false,
              bestValue: false,
              ceramicEligible: false,
              duration: {
                minMinutes: 120,
                maxMinutes: 180,
              },
            },
            {
              id: 'gold',
              name: 'Gold Package',
              tagline: 'The Prestige Clean',
              description: 'Mid-tier with enhanced services and deeper care.',
              features: [
                'Includes everything in Silver Package, plus:',
                'Shampoo of all seats and carpets including trunk',
                'Conditioning of dashboard, trim, and floor mats',
                'Headliner spot treatment',
                'Revive faded exterior plastics',
              ],
              basePriceCents: 24000,
              enabled: true,
              highlight: true,
              bestValue: false,
              ceramicEligible: false,
              duration: {
                minMinutes: 150,
                maxMinutes: 210,
              },
            },
            {
              id: 'platinum',
              name: 'Platinum Package',
              tagline: 'Executive Treatment',
              description: 'For those who want it all, and then some.',
              features: [
                'Includes everything in Gold Package, plus:',
                'Enzyme odor eliminator',
                'Premium leather conditioning',
                'Paint decontamination',
                'Paint enhancement applied',
              ],
              basePriceCents: 30000,
              enabled: true,
              highlight: false,
              bestValue: true,
              ceramicEligible: true,
              duration: {
                minMinutes: 180,
                maxMinutes: 240,
              },
            },
          ],
        },
        {
          id: 'interior',
          label: 'Interior Only',
          blurb: 'Seats, carpets, dash, and glass. The outside is left as is.',
          enabled: true,
          calEventSlug: 'interior',
          packages: [
            {
              id: 'silver',
              name: 'Basic Interior',
              tagline: 'The Essentials Reset',
              description: 'A simple, but effective reset.',
              features: [
                'Full interior vacuum including trunk',
                'Scrub/wipe down all surfaces including door jambs',
                'Streak-free glass clean',
                'Stain spot treatment',
              ],
              basePriceCents: 12500,
              enabled: true,
              highlight: false,
              bestValue: false,
              ceramicEligible: false,
              duration: {
                minMinutes: 60,
                maxMinutes: 90,
              },
            },
            {
              id: 'gold',
              name: 'Value Interior',
              tagline: 'Refined & Restored',
              description: 'Added shampoo & conditioning for a deeper clean.',
              features: [
                'Everything in Basic Interior, plus:',
                'Full interior shampoo including trunk',
                'Dashboard, trim, and floor mat conditioning',
                'Headliner spot clean',
              ],
              basePriceCents: 14000,
              enabled: true,
              highlight: true,
              bestValue: false,
              ceramicEligible: false,
              duration: {
                minMinutes: 90,
                maxMinutes: 120,
              },
            },
            {
              id: 'platinum',
              name: 'Prestige Interior',
              tagline: 'Showroom Ready',
              description: 'The ultimate interior transformation.',
              features: [
                'Everything in Value Interior, plus:',
                'Enzyme odor eliminator',
                'Premium leather conditioning',
              ],
              basePriceCents: 17000,
              enabled: true,
              highlight: false,
              bestValue: false,
              ceramicEligible: false,
              duration: {
                minMinutes: 120,
                maxMinutes: 150,
              },
            },
          ],
        },
        {
          id: 'exterior',
          label: 'Exterior Only',
          blurb: 'Wash, wheels, glass, and protection for the paint.',
          enabled: true,
          calEventSlug: 'exterior',
          packages: [
            {
              id: 'silver',
              name: 'Basic Exterior',
              tagline: 'Fresh & Clean',
              description: 'Entry-level but sharp and fresh.',
              features: [
                'Professional hand wash/dry',
                'Deep clean rims & tires',
                '3 month ceramic sealant',
                'Tire shine applied',
              ],
              basePriceCents: 10000,
              enabled: true,
              highlight: false,
              bestValue: false,
              ceramicEligible: false,
              duration: {
                minMinutes: 60,
                maxMinutes: 90,
              },
            },
            {
              id: 'gold',
              name: 'Value Exterior',
              tagline: 'Head-Turning Refresh',
              description: 'Adds enhancement & plastics revival.',
              features: [
                'Everything in Basic Exterior, plus:',
                'Paint enhancement applied',
                'Revive faded exterior plastics',
              ],
              basePriceCents: 12500,
              enabled: true,
              highlight: true,
              bestValue: false,
              ceramicEligible: false,
              duration: {
                minMinutes: 90,
                maxMinutes: 120,
              },
            },
            {
              id: 'platinum',
              name: 'Prestige Exterior',
              tagline: 'Show-Car Status',
              description: 'Maximum exterior pop & protection.',
              features: [
                'Everything in Value Exterior, plus:',
                'Paint decontamination',
                '6 month ceramic sealant applied',
              ],
              basePriceCents: 15000,
              enabled: true,
              highlight: false,
              bestValue: false,
              ceramicEligible: true,
              duration: {
                minMinutes: 120,
                maxMinutes: 150,
              },
            },
          ],
        },
      ],
      vehicleSizes: [
        {
          id: 'car',
          label: 'Car / Sedan',
          surchargeCents: 0,
          enabled: true,
        },
        {
          id: 'suv',
          label: 'Small / Midsize SUV',
          surchargeCents: 2500,
          enabled: true,
        },
        {
          id: 'large-suv',
          label: 'Large SUV (3rd row)',
          surchargeCents: 4000,
          enabled: true,
        },
        {
          id: 'truck',
          label: 'Truck / Van',
          surchargeCents: 5500,
          enabled: true,
        },
      ],
      addons: [
        {
          id: 'headlight-restoration',
          name: 'Headlight Restoration',
          description: 'Crystal clear headlights',
          priceCents: 6500,
          enabled: true,
        },
        {
          id: 'bio-clean',
          name: 'Bio Clean',
          description: 'Cleaning any bodily fluids',
          priceCents: 6000,
          enabled: true,
        },
        {
          id: 'engine-bay-cleaning',
          name: 'Engine Bay Cleaning',
          description: 'Spotless engine compartment',
          priceCents: 5000,
          enabled: true,
        },
        {
          id: 'pet-hair-removal',
          name: 'Pet Hair Removal',
          description: 'Deep extraction of embedded pet hair',
          priceCents: 3500,
          enabled: true,
        },
        {
          id: 'water-spot-removal',
          name: 'Water Spot Removal',
          description: 'Remove stubborn water spots from paint',
          priceCents: 2500,
          enabled: true,
        },
      ],
      ceramicServices: [
        {
          id: 'graphene-coating',
          name: '5-7 Year Graphene Ceramic Coating',
          description: 'A deep, mirror-like shine that lasts years, not weeks.',
          priceCents: 85000,
          enabled: true,
          kind: 'coating',
          duration: {
            minMinutes: 180,
            maxMinutes: 300,
          },
          includedCorrectionId: 'paint-correction-1',
          note: 'You can upgrade to a 2-step correction when you book.',
        },
        {
          id: 'paint-correction-1',
          name: '1-Step Paint Correction & Polish',
          description:
            'Removes most swirls and light scratches in one session, usually 65% correction or more.',
          priceCents: 45000,
          enabled: true,
          kind: 'correction',
          duration: {
            minMinutes: 120,
            maxMinutes: 240,
          },
        },
        {
          id: 'paint-correction-2',
          name: '2-Step Paint Correction',
          description:
            'Compounding followed by polishing. Removes the most defects of any option.',
          priceCents: 65000,
          enabled: true,
          kind: 'correction',
          duration: {
            minMinutes: 120,
            maxMinutes: 240,
          },
        },
      ],
    },
  },
  {
    key: 'page:home',
    kind: 'page',
    value: {
      schemaVersion: 1,
      title: 'Home',
      metadata: {
        title: 'Home',
        description:
          'Professional car detailing services that make your vehicle shine like new. Experience the difference with our premium cleaning and protection services.',
      },
      sections: [
        {
          id: 'hero',
          type: 'hero',
          enabled: true,
          fields: {
            lines: ['Detailed', 'indoors'],
            body: 'Car detailing by appointment in a private Boise-area garage. Out of the sun and weather, we clean the car inside and out and protect the paint.',
            primaryLink: {
              label: 'Book a detail',
              href: '/booking#design-your-detail',
            },
            secondaryLink: {
              label: 'See prices',
              href: '/pricing',
            },
            facts: [
              {
                term: 'Where',
                detail: 'A private garage in the Boise area',
              },
              {
                term: 'Address',
                detail: 'Sent once you book',
              },
              {
                term: 'Scheduling',
                detail: 'Same-day slots when open',
              },
            ],
          },
        },
        {
          id: 'services',
          type: 'services',
          enabled: true,
          fields: {
            heading: 'Services',
            body: 'Choose from three detail packages for interior, exterior, or both. Prices here are for cars and sedans. SUVs and trucks cost a little more.',
            link: {
              label: 'Full price list',
              href: '/pricing',
            },
            items: [
              {
                categoryId: 'combo',
                name: 'Exterior and interior',
                description:
                  'Hand wash, wheels, glass, and trim, plus a full clean of the cabin.',
                href: '/pricing#packages',
              },
              {
                categoryId: 'interior',
                name: 'Interior only',
                description:
                  'Vacuum, spot treatment, glass, and a wipe-down of interior surfaces.',
                href: '/pricing#packages',
              },
              {
                categoryId: 'exterior',
                name: 'Exterior only',
                description:
                  'Hand wash, wheels, tires, and a coat of protection on the paint.',
                href: '/pricing#packages',
              },
              {
                serviceId: 'graphene-coating',
                includeEligiblePackage: true,
                name: 'Ceramic coating',
                description:
                  'Graphene coating with a one-step paint correction and an eligible detail package. Lasts five to seven years.',
                href: '/pricing#ceramic',
              },
            ],
          },
        },
        {
          id: 'how-it-works',
          type: 'steps',
          enabled: true,
          fields: {
            heading: 'How booking works',
            items: [
              {
                title: 'Build your detail',
                body: 'Pick a package and any extras. The price updates as you go, then you choose a time.',
              },
              {
                title: 'Bring the car in',
                body: 'Your confirmation email has the garage address. Drop the car off at your time and we work on it indoors.',
              },
              {
                title: 'Pay the balance at pickup',
                body: 'Any booking deposit goes toward your total. Look the car over when you pick it up, then pay the remaining balance. Card, cash, and Venmo all work.',
              },
            ],
            link: {
              label: 'Start booking',
              href: '/booking#design-your-detail',
            },
          },
        },
        {
          id: 'reviews',
          type: 'reviews',
          enabled: true,
          fields: {},
        },
        {
          id: 'recent-work',
          type: 'social',
          enabled: true,
          fields: {
            heading: 'Recent work',
            link: {
              label: 'Before and after photos',
              href: '/gallery',
            },
          },
        },
        {
          id: 'closing',
          type: 'cta',
          enabled: true,
          fields: {
            heading: 'Not sure what your car needs?',
            body: 'Call or text and describe it. We reply within a day, usually sooner.',
            showPhone: true,
            primaryLink: {
              label: 'Book a detail',
              href: '/booking#design-your-detail',
            },
            secondaryLink: {
              label: 'Send a message',
              href: '/contact',
            },
          },
        },
      ],
    },
  },
  {
    key: 'page:about',
    kind: 'page',
    value: {
      schemaVersion: 1,
      title: 'About Us',
      metadata: {
        title: 'About Us',
        description:
          'QuikSpit Auto Detailing is a Boise-area detailing business working by appointment out of a private garage. Learn about our approach and the owner behind it.',
        socialTitle: 'About QuikSpit Auto Detailing',
        socialDescription:
          'A Boise detailing business built on efficient work, fair prices, and cars treated like our own.',
      },
      sections: [
        {
          id: 'header',
          type: 'hero',
          enabled: true,
          fields: {
            heading: 'About QuikSpit',
            body: 'A Boise detailer working out of a private garage, run by an Idaho native who likes a job done right the first time.',
          },
        },
        {
          id: 'owner',
          type: 'owner',
          enabled: true,
          fields: {
            heading: 'Meet Garret',
            caption: 'Garret, owner',
            paragraphs: [
              'Garret was born and raised in Idaho and works in healthcare, where doing right by people is the whole job. He brings that same standard to QuikSpit: show up on time, do the work well, charge fairly for it.',
              'He started the business because he saw how much time people lose waiting on car care. Booking a set time and getting the car back when promised fixes that, and it lets him build something of his own in the community he grew up in.',
            ],
            approachHeading: 'How we work',
            approachParagraphs: [
              'QuikSpit exists to save you time. You book a set time, drop the car off, and we detail it indoors, out of the sun, wind, and dust that make outdoor work harder to get right.',
              'We keep the work efficient without cutting corners, so a detail costs less than you might expect and still holds up when you look closely. Every vehicle gets the same care we would give our own.',
              'Most of our customers come back and send their neighbors. That matters more to us than any single job.',
            ],
          },
        },
        {
          id: 'closing',
          type: 'cta',
          enabled: true,
          fields: {
            heading: 'Book a detail',
            body: "We're in the Boise area, and the garage address comes with your booking. Pick a package and a time, or send a question first.",
            primaryLink: {
              label: 'Book a detail',
              href: '/booking#design-your-detail',
            },
            secondaryLink: {
              label: 'Ask a question',
              href: '/contact',
            },
          },
        },
      ],
    },
  },
  {
    key: 'page:pricing',
    kind: 'page',
    value: {
      schemaVersion: 1,
      title: 'Pricing',
      metadata: {
        title: 'Pricing',
        description:
          'Pricing for auto detailing in Boise. Exterior, interior, and full detail packages plus add-ons, ceramic coating, and paint correction.',
      },
      sections: [
        {
          id: 'header',
          type: 'hero',
          enabled: true,
          fields: {
            heading: 'Pricing',
            body: 'Every package and add-on, with its price. The prices here are for cars and sedans; the booking page adjusts them for your vehicle.',
          },
        },
        {
          id: 'packages',
          type: 'services',
          enabled: true,
          fields: {
            heading: 'Packages',
            catalogGroup: 'categories',
            priceNote:
              'Prices shown are for cars and sedans. SUVs, trucks, and vans cost {surchargeRange} more.',
          },
        },
        {
          id: 'addons',
          type: 'services',
          enabled: true,
          fields: {
            heading: 'Add-ons',
            body: 'Add any of these to a package when you book.',
            catalogGroup: 'addons',
          },
        },
        {
          id: 'ceramic',
          type: 'services',
          enabled: true,
          fields: {
            heading: 'Ceramic coating and paint correction',
            body: 'Coating and paint correction need clean, decontaminated paint first. That comes with the Prestige Exterior and the Platinum Package.',
            catalogGroup: 'ceramicServices',
          },
        },
        {
          id: 'faq',
          type: 'faq',
          enabled: true,
          fields: {
            heading: 'Questions about price',
            items: [
              {
                q: 'Do prices vary by vehicle size?',
                a: 'Yes. The prices on this page are for cars and sedans. SUVs, trucks, and vans cost {surchargeRange} more depending on size. The booking page shows the exact price for your vehicle before you pick a time.',
              },
              {
                q: 'Where are you located?',
                a: 'In a private garage in the Boise area. The address is not public. You get it in your confirmation email once you book.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'Credit and debit cards, cash, Apple Pay, Google Pay, and Venmo.',
              },
            ],
          },
        },
        {
          id: 'closing',
          type: 'cta',
          enabled: true,
          fields: {
            heading: 'See the price for your car',
            body: 'Pick a package, your vehicle size, and any extras. The total updates as you go, then you choose a time.',
            primaryLink: {
              label: 'Build your detail',
              href: '/booking#design-your-detail',
            },
            showPhone: true,
          },
        },
      ],
    },
  },
  {
    key: 'page:contact',
    kind: 'page',
    value: {
      schemaVersion: 1,
      title: 'Contact Us',
      metadata: {
        title: 'Contact Us',
        description:
          'Get in touch with QuikSpit Auto Detailing for a quote, to schedule a service, or to ask a question. Car detailing by appointment in the Boise, Idaho area.',
      },
      sections: [
        {
          id: 'header',
          type: 'hero',
          enabled: true,
          fields: {
            heading: 'Contact',
            body: 'Call, text, or send a note. We reply within a day, usually sooner.',
          },
        },
        {
          id: 'contact',
          type: 'contact',
          enabled: true,
          fields: {
            submitLabel: 'Send message',
            sendingLabel: 'Sending…',
            successMessage: 'Message sent. We\'ll reply within a day.',
            photoLabel: 'Photo',
            formCopy: {
              nameLabel: 'Name',
              emailLabel: 'Email',
              messageLabel: 'What do you need?',
              messagePlaceholder: 'Vehicle, what it needs, and roughly when',
              optionalLabel: '(optional)',
              photoHint: 'JPG, PNG, or GIF, up to 5 MB.',
              nameRequired: 'Enter your name',
              emailRequired: 'Enter your email address',
              emailInvalid: 'Enter an email address like name@example.com',
              messageRequired: 'Tell us what you need',
              imageTooLarge: 'Image must be 5MB or smaller',
              imageTypeInvalid: 'Use a JPG, PNG, or GIF image',
              validationMessage: 'Some fields need attention. Check the messages next to them.',
              responseError: 'The message didn\'t send (error {status}). Try again, or call {phone}.',
              timeoutError: 'Sending took too long. Check your connection and try again.',
              connectionError: 'The message didn\'t send. Check your connection and try again, or call {phone}.',
            },
            phoneLabel: 'Phone, call or text',
            emailLabel: 'Email',
            hoursLabel: 'Hours',
            locationLabel: 'Location',
            socialLabel: 'Elsewhere',
            formHeading: 'Send a message',
            formDescription:
              'Ask about a service or get a quote. A photo of the car helps us quote accurately.',
          },
        },
      ],
    },
  },
  {
    key: 'page:booking',
    kind: 'page',
    value: {
      schemaVersion: 1,
      title: 'Book a detail',
      metadata: {
        title: 'Book a detail',
        description: 'Choose a package, add extras, and pick a time.',
      },
      sections: [
        {
          id: 'header',
          type: 'hero',
          enabled: true,
          fields: {
            heading: 'Book your detail',
            body: 'Choose a package, add extras, and pick a time. The garage address comes with your confirmation.',
          },
        },
        {
          id: 'design-your-detail',
          type: 'booking',
          enabled: true,
          fields: {
            copy: {
              vehicleLabel: 'Vehicle',
              packageLabel: 'Package',
              addonsLabel: 'Add-ons',
              extrasShortLabel: 'Extras',
              ceramicLabel: 'Paint protection',
              paintShortLabel: 'Paint',
              scheduleLabel: 'Date and time',
              timeShortLabel: 'Time',
              progressLabel: 'Booking progress',
              stepCount: 'Step {current} of {total}',
              vehicleHeading: 'What are we detailing?',
              vehicleDescription: 'Bigger vehicles take longer, so the price goes up a little with size.',
              vehicleGroupLabel: 'Vehicle size',
              basePriceLabel: 'Base price',
              packageHeading: 'Choose a package',
              packageDescription: 'Prices below already include your vehicle size.',
              hideDetailsLabel: 'Hide details',
              compareDetailsLabel: 'Compare what’s included',
              showDetailsLabel: 'What\'s included?',
              addonsHeading: 'Anything extra?',
              addonsDescription: 'Optional. Pick as many as you like, or continue without any.',
              ceramicHeading: 'Protect the paint?',
              ceramicDescription: 'Optional. Your package qualifies for ceramic coating and paint correction.',
              includedCorrectionMessage: '{service} comes with the coating.',
              upgradeLabel: 'Optional upgrade',
              correctionChoiceHint: '(choose one, or none)',
              upgradeServiceLabel: 'Upgrade to {service}',
              scheduleHeading: 'Pick a time',
              scheduleDescription: 'Choose a day and time that works. You pay when the job is done.',
              calendarLoading: 'Loading the calendar…',
              calendarPreview: 'The Cal.com calendar appears here on the live site.',
              checkingPrice: 'Checking the price…',
              stalePriceMessage: 'Our prices were just updated. Reload the page to see the current price before you pick a time.',
              rejectedSelectionMessage: 'Part of this selection is no longer offered. Reload the page to see what is available.',
              reloadPricesLabel: 'Reload prices',
              backToLabel: 'Back to {step}',
              backLabel: 'Back',
              choosePackageHint: 'Choose a package to continue',
              continueToLabel: 'Continue to {step}',
              continueLabel: 'Continue',
              summaryLabel: 'Booking summary',
              summaryHeading: 'Your detail',
              editLabel: 'Edit',
              coatingLabel: 'Ceramic coating',
              correctionLabel: 'Paint correction',
              durationLabel: 'Takes about',
              estimatedTotalLabel: 'Estimated total',
              depositTodayLabel: 'Deposit today',
              dueAtAppointmentLabel: 'Due at the appointment',
              finalPriceMessage: 'The final price can change if the car needs more work than expected.',
              choosePackageMessage: 'Choose a package to see the total.',
              hideSummaryLabel: 'Hide',
              showSummaryLabel: 'Details',
              confirmationHeading: 'You\'re booked',
              confirmationDescription: 'A confirmation email with the time and the garage address is on its way.',
              totalLabel: 'Total',
              bookingDepositLabel: 'Booking deposit',
              paidAmountLabel: '{amount} paid',
              balanceLabel: 'Balance at service',
              prepHeading: 'Before your appointment',
              prepAddress: 'Check your email for the garage address. We don\'t publish it anywhere else.',
              prepValuables: 'Take any valuables out of the car.',
              prepArrival: 'Arrive on time so the detail can start on schedule.',
              prepReschedule: 'Need to move it? Reschedule for free up to 24 hours ahead.',
              questionsLabel: 'Questions? Call or text',
            },
            heading: 'Design your detail',
            depositPolicy:
              'A {depositAmount} deposit holds the slot. It is refunded in full if you cancel at least 24 hours ahead.',
          },
        },
        {
          id: 'faq',
          type: 'faq',
          enabled: true,
          fields: {
            heading: 'Before you book',
            items: [
              {
                q: 'How far in advance should I book?',
                a: 'Two days ahead gets you the widest choice of times. Same-day slots open up sometimes, so check the calendar.',
              },
              {
                q: 'What if I need to reschedule or cancel?',
                a: 'Reschedule or cancel at least 24 hours ahead. If something comes up later than that, call or text as soon as you can.',
                depositAnswer:
                  'Reschedule or cancel at least 24 hours ahead and your deposit is refunded in full. Inside 24 hours, the deposit is kept.',
              },
              {
                q: 'Where is the detail done?',
                a: 'In a private garage in the Boise area. We don’t publish the address. It comes in your confirmation email once you book.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'Credit and debit cards, cash, Apple Pay, Google Pay, and Venmo.',
              },
            ],
          },
        },
      ],
    },
  },
  {
    key: 'page:gallery',
    kind: 'page',
    value: {
      schemaVersion: 1,
      title: 'Gallery',
      metadata: {
        title: 'Gallery',
        description:
          'See QuikSpit detailing work in Boise: before and after comparisons, interior details, and exterior polish results.',
      },
      sections: [
        {
          id: 'header',
          type: 'hero',
          enabled: true,
          fields: {
            heading: 'Gallery',
            body: 'Recent work from around the Boise area. Drag the sliders to compare before and after.',
          },
        },
        {
          id: 'gallery',
          type: 'gallery',
          enabled: true,
          fields: {
            fallbackMessage:
              'Showing a saved copy of the gallery. The newest photos will be back shortly.',
          },
        },
        {
          id: 'reviews',
          type: 'reviews',
          enabled: true,
          fields: {},
        },
        {
          id: 'social',
          type: 'social',
          enabled: true,
          fields: {
            heading: 'Follow the work',
            body: 'New jobs and short clips go up on Instagram and TikTok first.',
          },
        },
        {
          id: 'closing',
          type: 'cta',
          enabled: true,
          fields: {
            heading: 'Your car next',
            body: 'Pick a package and a time. The garage address comes with your confirmation.',
            primaryLink: {
              label: 'Book a detail',
              href: '/booking#design-your-detail',
            },
            secondaryLink: {
              label: 'See prices',
              href: '/pricing',
            },
          },
        },
      ],
    },
  },
];
