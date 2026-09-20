// ============================================================
// EDIT THIS FILE to customize your gift box.
// You don't need to touch index.html, style.css, or script.js
// unless you want to change how it looks or behaves.
// ============================================================

const GIFT_CONFIG = {
  // Cover screen: heading, box image, tap text
  coverHeading: "sorry we missed you....\nso we've delivered your package digitally",
  coverImage: "assets/images/CarePackage.webp",
  coverImageAlt: "A digital care package box",
  tapText: "tap box to accept...",

  // Box (items) screen
  boxHeading: "a few little things...",
  goToFormLabel: "...a little request",

  // The items tucked inside the box.
  // type: "photo" | "note" | "gift" | "link"
  items: [
    {
      id: "item1",
      type: "note",
      label: "a note",
      text: 
            `Happy Birthday!!! 🎉😭🎂...again, sorry its taken so long to get this too you. 
            Of course youre no stranger to keldin time when it comes to these things. 

            But onto the important stuff, the details! So unfortunately, September ended up 
            being a busier month than anticipated lots on...so this is kinda plan B 😅
            
            Hopefully, you'll still enjoy it though....so first stop will be in city booked for 11.30am 
            (I know I said 11.45am, but they had to move it)...further details on this when you 
            open the gift box.
            
            So let me know if ya'll going to head back to Chris' mums place or your parents place 
            right after the first activity...and Ill sort the transport so you guys can fuss around 
            with transport...aim here is to keep ya relaxed. 
            
            At this point figured you guys can have time to do whatever ya'll need to do, and then 
            Second stop! My place for dinner/kick back/chill maybe even a cheecky session of SDV if the 
            spirits are in our favour that day 👻`
    },
    {
      id: "item2",
      type: "gift",
      label: "a little gift",
      image: "assets/images/zenDay-Voucher.webp",
      text: 
            `A little something, just because...
             
             So I figured its been awhile and that you could use a nice bit of relaxation, 
             with a bit of nostaliga, you know between all the watering fields and...parents lol. 
             Booked you guys the Lovers Relax treatment...was trying to find the one we did last time. 
             But I mean hey its got relax in the name and it looked like a good combo of treatments, 
             45minutes hot oil massage and 45 minutes skil refining facial.
             
             As mentioned previously its booked for 11.30, and should be under your name. 
             
             `,
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.711778992451!2d151.2223448126269!3d-33.87131807311393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12ae11f71e6b4b%3A0xd4bb4323f68801e2!2sZen%20Day%20Spa!5e0!3m2!1sen!2sau!4v1789895870986!5m2!1sen!2sau",
    },
    {
      id: "item3",
      type: "note",
      label: "placeholder",
      image: "assets/images/cat-sprite.gif",
      imageBelow: true,
      plainBackground: true,
      text: "Just wanted to say I'm really glad I know you. That's it, that's the note."
    }
  ],

  // The "leave something in return" form.
  //
  // Supported question types:
  //   "text"       — free text input. Optional "info" adds a hover/tap (i) tooltip.
  //   "textarea"   — free text, multi-line.
  //   "radio"      — pick one option. Each option can optionally have a
  //                  "reaction" (grey inline text shown when picked) or an
  //                  "emoji" (shown inline when picked).
  //   "spice-radio"— like "radio", but an option can be marked "dodge: true"
  //                  to make it evade the cursor and reject clicks/taps,
  //                  showing "unavailableText" instead of ever being selectable.
  //   "yesno-fire" — a Yes/No choice where "Yes" reveals 🔥 emoji one at a
  //                  time (like a typing indicator) that then stay put.
  form: {
    heading: "a little request on your preference…",
    subheading: "answer a few things and I'll get them — no need to send anything back yourself.",
    questions: [
      {
        id: "when",
        label: "What time did you guys want to come over to my place?",
        type: "text",
        required: false
      },
      {
        id: "cuisine",
        label: "What type of cuisine theme would you like?",
        type: "text",
        required: false,
        info: "Im too indecisive and since its your bday dinner hang, you can make the decision lol\n\nAsian, Mexcian, Indian, BBQ etc let me know whatever you're feeling for really"
      },
      {
        id: "spice",
        label: "In case of any spice included in dishes, please select level:",
        type: "spice-radio",
        options: [
          {
            id: "none",
            label: "Non spicy - but I like flavour",
            reaction: "hmmm I dont know…👀 doesnt look like you do."
          },
          {
            id: "mild",
            label: "Mild - a nice balance",
            dodge: true,
            unavailableText: "sorry - unavailable"
          },
          {
            id: "moderate",
            label: "Moderate - a bit of spice",
            reaction: "Im not judging….im just disapointed"
          },
          {
            id: "hot",
            label: "I like flavour give me that spice!",
            reaction: "Good option, very wise, spririts will be in your favour and crops will be plentiful 👍🏽"
          }
        ]
      },
      {
        id: "fire",
        label: "Would you like a fire on the evening?",
        type: "yesno-fire"
      },
      {
        id: "drinks",
        label: "Any preference on drinks?",
        type: "radio",
        options: [
          { id: "cocktails", label: "Cocktails/beer" },
          { id: "wine", label: "Wine/mulled Wine" },
          { id: "both", label: "¿Por qué no los dos?", emoji: "🎉" }
        ]
      },
      {
        id: "message",
        label: "anything else you'd like to add/request?",
        type: "textarea",
        required: false
      }
    ],
    submitLabel: "submit preferences",
    sentHeading: "sent, with love",
    sentBody: "your note is on its way. thank you for opening this."
  },

  // ---- EmailJS credentials (see README.md, Step 2) ----
  emailjs: {
    publicKey: "YOUR_PUBLIC_KEY",
    serviceId: "YOUR_SERVICE_ID",
    templateId: "YOUR_TEMPLATE_ID"
  }
};
