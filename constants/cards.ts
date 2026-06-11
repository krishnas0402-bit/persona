import { IdentityId } from "./theme";

export interface Card {
  action: string;
  why: string;
  reflection: string;
  challenge: string;
  affirmation: string;
  mantra: string;
}

export const CARDS: Record<IdentityId, Card[]> = {
  disciplined: [
    {
      action: "Do the hardest task on your list first. No warm-up. No scrolling. Just start.",
      why: "Willpower is highest in the first 90 minutes. Spending it on anything else is waste.",
      reflection: "What would a more disciplined version of you do right now that the current you is avoiding?",
      challenge: "Write down 3 things you said you'd do this week. Did you do them? Be honest.",
      affirmation: "You don't need motivation. You have a standard.",
      mantra: "Do it scared. Do it tired. Do it anyway.",
    },
    {
      action: "Set your phone face-down for the next 90 minutes. No exceptions.",
      why: "Every notification is someone else's agenda interrupting yours.",
      reflection: "Where did you give in this week? What did it cost you?",
      challenge: "Track how many times you check your phone today. Just count. Don't judge yet.",
      affirmation: "Discipline is just keeping the promise you made to yourself.",
      mantra: "The standard doesn't move. You rise to it.",
    },
    {
      action: "Write your top 3 priorities for today. Work on nothing else.",
      why: "A list of 10 is a list of 0. Three forces real decisions.",
      reflection: "What does your future self thank you for doing today?",
      challenge: "End today without checking social media until after your top priority is done.",
      affirmation: "Every rep, every page, every early morning — it compounds invisibly.",
      mantra: "You are what you repeatedly do.",
    },
    {
      action: "Wake up 30 minutes earlier tomorrow. Set the alarm now.",
      why: "The morning is the one time of day that belongs entirely to you.",
      reflection: "What version of your day would you be proudest of at midnight?",
      challenge: "No snooze button for 7 days straight. Start today.",
      affirmation: "You are building something most people will never build — yourself.",
      mantra: "The price of discipline is always less than the cost of regret.",
    },
    {
      action: "Say no to one thing today that doesn't align with your current focus.",
      why: "Every yes to the wrong thing is a no to the right thing.",
      reflection: "What are you tolerating that a disciplined person wouldn't?",
      challenge: "Write your personal standard — one sentence. What do you hold yourself to?",
      affirmation: "Your future is built in the decisions nobody sees you make.",
      mantra: "Consistency beats intensity. Every single time.",
    },
  ],
  wealthy: [
    {
      action: "Open your bank app. Track every expense from yesterday. Categorize each one.",
      why: "You cannot optimize what you do not measure. Wealthy people know their numbers.",
      reflection: "If your bank account was a reflection of your beliefs about money — what would it say?",
      challenge: "Find one subscription you're paying for and not using. Cancel it today.",
      affirmation: "You are building. The results are delayed, not absent.",
      mantra: "Money flows to those who respect it.",
    },
    {
      action: "Read one page — just one — about investing, business, or money today.",
      why: "Financial literacy compounds faster than any investment. One page a day is 365 pages a year.",
      reflection: "What decision are you avoiding that your wealthier self would make immediately?",
      challenge: "Calculate your actual hourly rate today. Is how you spent time worth that rate?",
      affirmation: "Wealthy people solve problems. You are a problem solver.",
      mantra: "Your next level requires your next decision.",
    },
    {
      action: "Identify one income stream you could start with zero capital this month.",
      why: "The first rupee from something you built yourself changes your relationship with money forever.",
      reflection: "What would your life look like in 5 years if you made today's decisions consistently?",
      challenge: "Write down 5 problems people around you have that you could solve for money.",
      affirmation: "Wealth is a byproduct of the value you create. Create more.",
      mantra: "Build, don't just earn.",
    },
    {
      action: "Negotiate something today. A bill, a rate, a deal. Anything.",
      why: "Wealthy people understand that most prices are starting points, not final offers.",
      reflection: "Where are you leaving money on the table because you're afraid to ask?",
      challenge: "Find one asset you own that could be working harder for you right now.",
      affirmation: "You deserve the wealth you are willing to build for.",
      mantra: "Revenue is vanity. Profit is sanity. Cash flow is reality.",
    },
    {
      action: "Write down your net worth today. Assets minus liabilities. Just the number.",
      why: "Knowing your number is the first step to changing it.",
      reflection: "Are you spending like the person you are, or the person you want to become?",
      challenge: "Automate one savings transfer today, even ₹500.",
      affirmation: "You are not behind. You are exactly early enough to start.",
      mantra: "The best investment you'll ever make is in your own understanding.",
    },
  ],
  creative: [
    {
      action: "Make something imperfect today. Start it, finish it, share it. In that order.",
      why: "Perfectionism is procrastination wearing a productive mask.",
      reflection: "What idea have you been sitting on because it isn't 'ready' yet?",
      challenge: "Create something in under 20 minutes with whatever is in front of you right now.",
      affirmation: "You notice things. That is your unfair advantage.",
      mantra: "Ship it. Refine it after.",
    },
    {
      action: "Write 3 specific observations about something ordinary you see every day.",
      why: "Creativity isn't invention. It's attention. Train yours.",
      reflection: "When did you last make something just for yourself — no audience, no validation?",
      challenge: "Spend 15 minutes consuming work that intimidates you with its quality. Study it, don't envy it.",
      affirmation: "Creativity isn't a talent. It's a practice you keep showing up for.",
      mantra: "Every creator you admire once had zero followers.",
    },
    {
      action: "Write down the one project you keep thinking about but haven't started. Name it.",
      why: "Unnamed things stay dreams. Named things become plans.",
      reflection: "What would you make if failure wasn't part of the equation?",
      challenge: "Do the first 10 minutes of that project. Just 10. Right now.",
      affirmation: "The world doesn't need another consumer. It needs what only you can make.",
      mantra: "The blank page is not your enemy. Waiting is.",
    },
    {
      action: "Change your environment for 2 hours today. New space, new output.",
      why: "The brain associates location with behaviour. New space, new thinking.",
      reflection: "What would you create if you knew it would definitely find its audience?",
      challenge: "Collaborate with someone today — even a five-minute conversation about a shared idea.",
      affirmation: "Your perspective is the rarest thing you own. Use it.",
      mantra: "Constraints are not limits. They are the shape of your creativity.",
    },
    {
      action: "Consume zero content for the first hour of your day. Just create instead.",
      why: "Input fills the space that output needs. Protect the morning.",
      reflection: "Are you creating, or are you curating other people's creation?",
      challenge: "Fill one page — any medium — with something that only you would make.",
      affirmation: "Your creative voice gets stronger every time you use it and weaker every time you don't.",
      mantra: "Make the thing. The audience follows the maker.",
    },
  ],
  athletic: [
    {
      action: "Move your body for 20 minutes today. No conditions. No excuses.",
      why: "The body is the instrument. Everything else runs on it.",
      reflection: "What physical version of yourself would you be proud of at 35?",
      challenge: "No elevator, no auto-rickshaw for short distances today. Walk everything under 15 minutes.",
      affirmation: "You are not tired. You are adapting.",
      mantra: "The body keeps score. Train it like it matters.",
    },
    {
      action: "Drink 3 litres of water before sunset. Start now.",
      why: "A 2% drop in hydration cuts cognitive performance by 20%. Most people run on 60%.",
      reflection: "What one physical habit, done daily, would transform how you feel in 90 days?",
      challenge: "Sleep before midnight tonight. Guard your recovery like a training session.",
      affirmation: "Every session is a vote for the person you're becoming.",
      mantra: "Show up. The body follows the mind that shows up.",
    },
    {
      action: "Do 10 minutes of mobility or stretching before you open any screen today.",
      why: "Stiffness is a choice. So is flexibility. Make it deliberately.",
      reflection: "Are you building a body you respect?",
      challenge: "Eat one meal today with no ultra-processed ingredients. Just one.",
      affirmation: "Athletes aren't born. They're built one decision at a time.",
      mantra: "Rest is part of the training. Recovery is not weakness.",
    },
    {
      action: "Do one set to failure today. Whatever the movement. One set. Everything you have.",
      why: "The body doesn't change in its comfort zone. It changes at the edge.",
      reflection: "What physical goal are you working toward that actually excites you?",
      challenge: "Track your sleep tonight. 7+ hours is a non-negotiable.",
      affirmation: "Your body is capable of far more than your mind currently believes.",
      mantra: "Train hard, recover harder. Both are the work.",
    },
    {
      action: "Eat protein first at every meal today.",
      why: "Protein controls hunger, preserves muscle, and stabilises energy. It is the foundation.",
      reflection: "If you had to grade your nutrition this week — what's the honest score?",
      challenge: "Add one new movement to your routine today that you've never done before.",
      affirmation: "Consistency over intensity. Show up imperfectly rather than not at all.",
      mantra: "The best workout is the one you actually do.",
    },
  ],
  serene: [
    {
      action: "Sit in complete silence for 5 minutes before opening any app this morning.",
      why: "The mind that can sit with nothing is the mind that can handle everything.",
      reflection: "What are you trying to escape by staying busy?",
      challenge: "Identify the one thing causing you the most anxiety right now. Write what's actually in your control.",
      affirmation: "Peace is not the absence of chaos. It is indifference to it.",
      mantra: "You are not behind. You are exactly where you need to be.",
    },
    {
      action: "Let one thing go today that you've been holding too tightly.",
      why: "Attachment to outcomes is the source of most suffering. Practice releasing one thing.",
      reflection: "What would change if you truly believed everything is working out for you?",
      challenge: "For the next hour, respond to everything with 2 seconds of pause before you react.",
      affirmation: "Stillness is strength. The world is loud. You don't have to be.",
      mantra: "The calm person in the room has the most power.",
    },
    {
      action: "Text one person who makes you feel most like yourself.",
      why: "Serenity isn't isolation. It's choosing the right people deliberately.",
      reflection: "What does your mind do when there's nothing to react to?",
      challenge: "No news, no social media, no content consumption for 3 hours today.",
      affirmation: "You are not your thoughts. You are the one watching them.",
      mantra: "Less reaction. More intention.",
    },
    {
      action: "Take one walk today with no phone, no podcast, no music. Just walk.",
      why: "The mind processes what the body moves through. Walking is thinking.",
      reflection: "What would you do differently if you stopped needing it to look good to others?",
      challenge: "Write three things that are going well. Not three goals. Three things that already are.",
      affirmation: "You have everything you need to handle today. Everything else is noise.",
      mantra: "Presence is the rarest gift you can give yourself.",
    },
    {
      action: "Set a hard stop time for work today. When it comes — stop. Fully.",
      why: "Rest is not laziness. It is the system rebooting so it can run again.",
      reflection: "Where do you confuse productivity with worth?",
      challenge: "Do one thing today purely for enjoyment. No outcome. No purpose. Just because.",
      affirmation: "A rested mind makes better decisions than an exhausted one.",
      mantra: "You cannot pour from an empty vessel. Fill yours.",
    },
  ],
};

export const getDailyCard = (identityId: IdentityId, dateStr: string): { card: Card; index: number } => {
  const cards = CARDS[identityId];
  // Deterministic daily card based on date — same card for everyone on same day
  const dateHash = dateStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = dateHash % cards.length;
  return { card: cards[index], index };
};
