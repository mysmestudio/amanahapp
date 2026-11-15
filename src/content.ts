// @ts-nocheck
/* SeedLine content and scoring model. Ported from the workshop prototype. */
export const CFG = {
  url: "https://hepkqzdpmntrzsmbxxxj.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlcGtxemRwbW50cnpzbWJ4eHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MDg3NDcsImV4cCI6MjExMDI4NDc0N30.TyNJMh05fUSI2kluyvqwrTxoDQIILtRYF41uWY_x454",
  vapid: "BM-RohVyCsNmwO49cz9uIdz6EPIqNLRLmjZTYB0gppTVAAwztp_57wRWLhnJ4whXev6CPbBtn4wWBe4TsfToZtY"
};
const params = new URLSearchParams(typeof location !== "undefined" ? location.search : "");
export const ROOM = ((params.get("room") || "msmmi26").toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,24)) || "msmmi26";
export const ORIGIN = typeof location !== "undefined" ? location.origin : "";
export const JOIN = ORIGIN + "/app" + (ROOM !== "msmmi26" ? "?room="+ROOM : "");
export const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* =================== MODEL =================== */
const STAGES = [
  {id:"survive", name:"Surviving", plant:"Seed", min:0, color:"var(--survive)",
   means:"Most months, money in is about the same as money out, or less. Borrowing or help from others fills the gaps.",
   next:"A small amount left over every month that you actually keep.",
   focus:"Fix now: create breathing room before anything else."},
  {id:"stabilise", name:"Stabilising", plant:"Sprout", min:35, color:"var(--stabilise)",
   means:"Money comes in and some of it stays. You are not in crisis. But one big hit, like a lost job or a hospital bill, could push you back into borrowing.",
   next:"Savings that happen automatically, debts getting smaller, and enough put aside to live for 3 months without income.",
   focus:"Fix now, then start to Grow."},
  {id:"build", name:"Building", plant:"Stalk", min:60, color:"var(--build)",
   means:"Your home can take a hit without falling apart. The question now is whether your money and skills are working for you.",
   next:"More than one income, and money growing in halal places you have checked properly.",
   focus:"Grow next: put your money and skills to work."},
  {id:"legacy", name:"Legacy", plant:"Harvest", min:80, color:"var(--legacy)",
   means:"You are building something that can outlive you. The danger now is losing it through missing records, family disputes or fraud.",
   next:"Everything written down, a wasiyyah (Islamic will) in place, and children who understand money.",
   focus:"Protect for later: make sure it lasts and lands well."}
];
const stageOf = s => STAGES.slice().reverse().find(x => s >= x.min);

const PARTS = {
  income:     {name:"Income",          plain:"How many streams of money come in, and how steady they are."},
  surplus:    {name:"What you keep",   plain:"What is left after the month's spending, and whether you save it on purpose."},
  safety:     {name:"Your cushion",    plain:"How long your home could manage if the main income stopped."},
  debt:       {name:"Debt",            plain:"How much of next month's money is already promised to someone else."},
  productive: {name:"Money at work",   plain:"Whether your savings and skills are growing, or just sitting still."},
  legacy:     {name:"Protect & pass on", plain:"Whether your family could find, prove and fairly share what you own."}
};
const TIE = ["surplus","safety","debt","income","productive","legacy"];
const WEIGHTS = {income:15, surplus:20, safety:20, debt:15, productive:15, legacy:15};

const SEED = {
  S:{name:"Surplus", story:"The seed", color:"var(--seed)",   plain:"What you keep after spending each month. No seed, nothing grows.", built:"What's left each month, and whether you save first"},
  T:{name:"Time",    story:"The season", color:"var(--season)", plain:"How long you can leave your savings alone. Emergencies and debt force you to dig the seed up early.", built:"Your cushion and your debt"},
  P:{name:"Productive use", story:"The soil", color:"var(--soil)", plain:"Is your money planted in something that grows, like a business, a halal investment or a skill? Or is it sitting in a drawer?", built:"Where savings sit, how you check investments, and building skills"},
  G:{name:"Good stewardship", story:"The harvest", color:"var(--harvest)", plain:"Earning honestly, keeping records, and passing things on well so the harvest is not lost.", built:"Money talks at home, written records, wasiyyah, next of kin, children, regular sadaqah"}
};

const CUR = {
  NG:{sym:"₦", bands:["Under ₦300k","₦300k – ₦700k","₦700k – ₦1.5m","₦1.5m – ₦3m","Above ₦3m"]},
  US:{sym:"$", bands:["Under $3k","$3k – $6k","$6k – $10k","$10k – $20k","Above $20k"]},
  UK:{sym:"£", bands:["Under £2k","£2k – £4k","£4k – £7k","£7k – £12k","Above £12k"]},
  OTHER:{sym:"$", bands:["Under $1k","$1k – $3k","$3k – $6k","$6k – $12k","Above $12k"]}
};

const Q = [
  {id:"country", setup:true, tag:"Setting up", q:"Where do you live?", help:"So the money ranges make sense to you.",
   opts:[{l:"Nigeria",v:"NG"},{l:"United States",v:"US"},{l:"United Kingdom",v:"UK"},{l:"Somewhere else",v:"OTHER"}]},
  {id:"band", setup:true, tag:"Setting up", q:"Roughly, how much comes into your home each month?", help:"After tax. A range is enough. If you're single, just your own income. Keep this number in mind.",
   opts:"bands"},
  {id:"sources", part:"income", q:"How many different sources of money does your home have?", help:"A salary, a business, rent, side jobs. Anything that brings money in regularly.",
   opts:[{l:"One",s:"If it stops, everything stops",v:20},{l:"Two",v:65},{l:"Three or more",v:100}]},
  {id:"steady", part:"income", q:"Do you know how much is coming in each month?",
   opts:[{l:"No, it goes up and down a lot",v:20},{l:"Mostly, with some surprises",v:60},{l:"Yes, it's very predictable",v:100}]},
  {id:"left", part:"surplus", q:"At the end of a normal month, how much is left?", help:"Think of every {100} that comes into your home. After food, rent, school fees, transport and family support, how much of it is still there?",
   opts:[{l:"Nothing, we run out",s:"We borrow or ask for help to finish the month",v:0},{l:"Almost nothing",s:"Less than {5} out of every {100}",v:15},{l:"A little",s:"About {5} to {10} out of every {100}",v:45},{l:"A good amount",s:"About {10} to {20} out of every {100}",v:75},{l:"A lot",s:"More than {20} out of every {100}",v:100}]},
  {id:"first", part:"surplus", q:"When money comes in, what happens to savings?",
   opts:[{l:"We save whatever is left, if anything",v:20},{l:"Sometimes we put savings aside first",v:55},{l:"Savings leave automatically on payday",s:"Before we spend anything",v:100}]},
  {id:"spend", part:"surplus", q:"Without opening your banking app, how much did your home spend last month?", help:"Be honest. Most families are surprised by the real number.",
   opts:[{l:"I could say within {20}",s:"I track it",v:100},{l:"Roughly",s:"I have a fair idea",v:60},{l:"I'd be guessing",v:25},{l:"No idea at all",v:5}]},
  {id:"social", part:"surplus", q:"How do family support, owambe, aso-ebi and contributions affect your month?", help:"Money for parents, siblings, celebrations, weddings and community dues.",
   opts:[{l:"Planned and budgeted",s:"We know the amount and set it aside",v:100},{l:"Unplanned, but manageable",s:"It surprises us, but we cope",v:50},{l:"They often push us into debt or to zero",v:10}]},
  {id:"runway", part:"safety", q:"If your main income stopped today, how long could you pay for the basics?", help:"Using only money you can get to quickly. No borrowing, no selling things.",
   opts:[{l:"Less than two weeks",v:0},{l:"About a month",v:30},{l:"One to three months",v:60},{l:"Three to six months",v:85},{l:"More than six months",v:100}]},
  {id:"cover", part:"safety", q:"If someone fell seriously ill, is there health cover?", help:"Health insurance, an HMO, or takaful.",
   opts:[{l:"No cover",v:0},{l:"Some of us are covered",v:50},{l:"Everyone is covered",v:100}]},
  {id:"emergency", part:"safety", q:"A family emergency needs {500} within 7 days. Where does it come from?", help:"Pick what would really happen, not what you'd like to happen.",
   opts:[{l:"Our own savings",v:100},{l:"Selling something we own",v:55},{l:"Borrowing from family or friends",v:35},{l:"A loan app or lender",v:10},{l:"We couldn't raise it",v:0}]},
  {id:"debtshare", part:"debt", q:"How much of your monthly income goes to paying back debts?", help:"Think of every {100} that comes in. Count loans, credit, salary advances and money owed to friends or family.",
   opts:[{l:"Nothing",s:"We have no debts",v:100},{l:"A little",s:"Less than {15} out of every {100}",v:75},{l:"A fair amount",s:"About {15} to {35} out of every {100}",v:40},{l:"A lot",s:"More than {35} out of every {100}",v:10}]},
  {id:"borrow", part:"debt", q:"Do you borrow to pay for normal things?", help:"Rent, food, school fees, transport.",
   opts:[{l:"Often",v:0},{l:"Sometimes",v:45},{l:"Never",v:100}]},
  {id:"hidden", part:"debt", q:"Is there any debt your spouse or family doesn't know about?", help:"Your answer never leaves this phone. Hidden debt is one of the biggest risks to a family's money.",
   opts:[{l:"No, everything is known",v:100},{l:"Yes, a small amount",v:40},{l:"Yes, a significant amount",v:5},{l:"I'd rather not say",v:20}]},
  {id:"where", part:"productive", q:"Where are your savings mostly kept?",
   opts:[{l:"Cash at home or a normal current account",s:"It shrinks as prices rise",v:15},{l:"A savings account",v:45},{l:"Spread across halal investments or a business",v:100}]},
  {id:"check", part:"productive", q:"When someone brings you an investment, how do you decide?",
   opts:[{l:"I don't invest yet",v:30},{l:"I trust the person who brought it",s:"A friend, a relative, a WhatsApp group",v:5},{l:"I check who runs it, its licence and whether it is halal",v:100}]},
  {id:"grow", part:"productive", q:"In the last year, did you spend money or time building a skill or business?",
   opts:[{l:"No",v:10},{l:"A little",v:55},{l:"Yes, seriously",v:100}]},
  {id:"inflation", part:"productive", q:"Over the last 12 months, did your savings grow faster than prices?", help:"Food, rent and school fees went up. Did your money keep up?",
   opts:[{l:"Yes, they beat rising prices",v:100},{l:"About the same",v:55},{l:"No, they lost value",v:20},{l:"I honestly don't know",v:10}]},
  {id:"talk", part:"legacy", q:"How often do you talk openly about money at home?", help:"With your spouse or family. If single, with whoever you share money matters with.",
   opts:[{l:"Rarely or never",v:10},{l:"Only when there's a problem",v:40},{l:"Regularly, as a habit",v:100}]},
  {id:"tonight", part:"legacy", q:"If the main earner died tonight, how soon could the family get money to run the home?", help:"Think of accounts in one person's name, passwords, and documents.",
   opts:[{l:"Within days",s:"Joint access or clear instructions exist",v:100},{l:"Within a month",v:55},{l:"Months, through court or bank processes",v:20},{l:"They wouldn't know where to start",v:5}]},
  {id:"zakat", part:"legacy", q:"Did you calculate and pay zakat on your wealth last year?", help:"Zakat is due on wealth above the nisab held for a lunar year.",
   opts:[{l:"Yes, calculated properly and paid",v:100},{l:"Our wealth is below the nisab",v:70},{l:"Paid something, but didn't calculate",v:55},{l:"Not sure if it applies to us",v:30},{l:"No",v:15}]},
  {id:"docs", part:"legacy", multi:true, q:"Which of these are already true for you?", help:"Tick all that apply. It's fine if none are.",
   opts:[{l:"There's a written list of what we own and owe",v:"register"},{l:"Someone I trust knows where our documents are",v:"location"},{l:"A wasiyyah (Islamic will) has been written",v:"wasiyyah"},{l:"Next of kin is up to date on our bank and pension accounts",v:"kin"},{l:"Our children are learning about money",v:"children"},{l:"We give regularly to a sadaqah jariyah or waqf",v:"jariyah"}]}
];
const SCORED = Q.filter(q => !q.setup).length;

function compute(a){
  const val = id => { const q = Q.find(x=>x.id===id); const o = (q.opts==="bands"?[]:q.opts).find(o=>o.v===a[id]); return o ? o.v : 0; };
  const avg = ids => { const got = ids.filter(id => a[id] != null || ["sources","steady","left","first","runway","cover","debtshare","borrow","where","check","grow","talk"].includes(id)); return Math.round(got.reduce((t,id)=>t+val(id),0)/Math.max(1, got.length)); };
  const docs = (a.docs||[]).length;
  const lev = {
    income: avg(["sources","steady"]),
    surplus: avg(["left","first","spend","social"]),
    safety: avg(["runway","cover","emergency"]),
    debt: avg(["debtshare","borrow","hidden"]),
    productive: avg(["where","check","grow","inflation"]),
    legacy: a.tonight != null ? Math.round(0.2*val("talk") + 0.2*val("tonight") + 0.15*val("zakat") + 0.45*(docs/6*100)) : Math.round(0.35*val("talk") + 0.65*(docs/6*100))
  };
  let score = Math.round(Object.keys(WEIGHTS).reduce((t,k)=>t+lev[k]*WEIGHTS[k]/100,0));
  const capped = lev.surplus <= 10 && score > 34;
  if (capped) score = 34;
  const weakest = TIE.slice().sort((x,y)=> lev[x]-lev[y] || TIE.indexOf(x)-TIE.indexOf(y))[0];
  const factors = {S:lev.surplus, T:Math.round((lev.safety+lev.debt)/2), P:lev.productive, G:lev.legacy};
  return {score, stage:stageOf(score), lev, weakest, capped, factors};
}
const levelWord = v => v < 35 ? {w:"Weak", c:"var(--survive)"} : v < 60 ? {w:"Getting there", c:"var(--stabilise)"} : v < 80 ? {w:"Good", c:"var(--build)"} : {w:"Strong", c:"var(--legacy)"};

/* =================== ACTIONS (Fix / Grow / Protect) =================== */
const BUCKETS = [
  {id:"fix",     name:"Fix now", verb:"protect the sprout", org:"Stabilise", sub:"Stop the leaks and build a cushion, so one bad month doesn't throw you back."},
  {id:"grow",    name:"Grow next", verb:"feed the soil", org:"Build",     sub:"Put your money and skills to work, carefully and halal."},
  {id:"protect", name:"Protect for later", verb:"store the harvest", org:"Document",  sub:"Write things down and plan ahead, so what you build reaches your family."}
];
const ACTIONS = [
  {b:"fix", part:"surplus", t:"Find out where the money goes", why:"You can't keep what you can't see.", week:"Write down every single spend for 7 days, in your phone notes or a notebook.", done:"You can name your top 3 money leaks."},
  {b:"fix", part:"surplus", t:"Save first, spend second", why:"Savings that wait for 'leftovers' rarely happen.", week:"On payday, move a fixed amount, even 5%, into a separate account before anything else. Set it as a standing order.", done:"The automatic transfer is set up."},
  {b:"fix", part:"surplus", t:"Agree three cuts together", why:"Money decisions stick when the whole home owns them.", week:"Have a 15-minute talk and choose 3 expenses to pause for 30 days.", done:"The three cuts are written down and agreed."},
  {b:"fix", part:"safety", t:"Open a 'not for spending' account", why:"A cushion stops one emergency turning into debt.", week:"Open a separate account or wallet. If possible, no debit card attached.", done:"The account is open with a first deposit."},
  {b:"fix", part:"safety", t:"Set your first cushion target", why:"One month of basics is your first finish line. Then three, then six.", week:"Add up a month of essentials: food, rent, school, transport. That's your target.", done:"Your target is written where you'll see it."},
  {b:"fix", part:"safety", t:"Get the family covered", why:"Hospital bills are the most common shock that pushes families into debt.", week:"Get a price for one HMO, health insurance or takaful option.", done:"You know the price and what it covers."},
  {b:"fix", part:"debt", t:"Put every debt on one page", why:"Debts feel smaller in your head than on paper.", week:"List who you owe, how much, the monthly payment and when it ends.", done:"One page, shared with your spouse if you're married."},
  {b:"fix", part:"debt", t:"30 days without borrowing to live", why:"Borrowing for rent or food keeps a home stuck in survival.", week:"Work out what would make it possible: a cut, selling something unused, or a little extra income.", done:"30 days with no new loan for normal expenses."},
  {b:"fix", part:"debt", t:"Clear the smallest debt first", why:"A quick win builds momentum.", week:"Pay a little extra on your smallest debt. When it's gone, add that amount to the next one.", done:"Your first debt is cleared."},
  {b:"fix", part:"income", t:"Check how safe each income is", why:"Knowing your weak spot is the first step to fixing it.", week:"List every income source and ask: what happens to us if this one stops?", done:"You know your most fragile income."},
  {b:"grow", part:"income", t:"Start a second income stream", why:"One income means one point of failure.", week:"Choose one skill that could earn money within 90 days and take the first step this week.", done:"You earn your first payment from it."},
  {b:"grow", part:"income", t:"Sell what you already know", why:"Your skills are an asset you already own.", week:"Offer a service you're good at to 3 people.", done:"One paying customer."},
  {b:"grow", part:"productive", t:"Wake up sleeping money", why:"Cash in a drawer quietly loses value as prices rise.", week:"Find one licensed, halal savings or investment option and run it through the investment check in Tools.", done:"You've checked one option properly."},
  {b:"grow", part:"productive", t:"Check before you invest", why:"Many families have lost savings to schemes that sounded halal.", week:"Run any offer you've received through the 6-question investment check.", done:"You can say yes or no, with reasons."},
  {b:"grow", part:"productive", t:"Invest in your earning power", why:"A skill can grow faster than any investment, and no one can steal it.", week:"Choose one course or certification and sign up.", done:"You are enrolled."},
  {b:"protect", part:"legacy", doc:"register", t:"Write your family asset list", why:"Your family can't claim what they can't find.", week:"Write what you own, where it's held and the proof of ownership. Add what you owe.", done:"One document, stored safely."},
  {b:"protect", part:"legacy", doc:"location", t:"Tell one trusted person where things are", why:"If something happened tonight, could your family find everything within 7 days?", week:"Show your spouse or a trusted person where documents and account details are kept.", done:"They know where to look."},
  {b:"protect", part:"legacy", doc:"wasiyyah", t:"Start your wasiyyah", why:"Islam fixes the shares of inheritance. A wasiyyah handles the rest, names a guardian for your children and prevents disputes.", week:"Book a conversation with a scholar or a lawyer who handles Islamic wills.", done:"The appointment is booked."},
  {b:"protect", part:"legacy", doc:"children", t:"Have a money talk with your children", why:"What your children know about money is part of your legacy.", week:"Talk about earning halal, saving and giving, in words that fit their age.", done:"One conversation done."},
  {b:"protect", part:"legacy", doc:"jariyah", t:"Start a small sadaqah jariyah", why:"Charity that keeps benefiting people keeps rewarding you after you're gone.", week:"Choose one ongoing cause: a well, a school, a mosque, a Qur'an. Set a small regular amount.", done:"Your first regular amount is set."}
];
function roadmap(r, answers){
  const done = new Set(answers.docs||[]);
  const order = TIE.slice().sort((x,y)=> r.lev[x]-r.lev[y]);
  const out = {fix:[], grow:[], protect:[]};
  order.forEach(p => ACTIONS.filter(a=>a.part===p && !(a.doc && done.has(a.doc))).forEach(a => out[a.b].push(a)));
  if (!out.protect.length) out.protect.push({b:"protect", part:"legacy", t:"Review your family file once a year", why:"Life changes: births, marriages, new assets.", week:"Put a yearly date in your calendar to update your asset list, next of kin and wasiyyah.", done:"The date is in your calendar."});
  Object.keys(out).forEach(k => out[k] = out[k].slice(0,3));
  return out;
}

/* =================== COURSE =================== */
const TRACKS = {
  keep:{name:"Keep", story:"the seed",    color:"var(--seed)",   sub:"Know your money and keep some of it."},
  last:{name:"Last", story:"the season",  color:"var(--season)", sub:"Build a cushion and tame debt so you never have to dig up the seed."},
  grow:{name:"Grow", story:"the soil",    color:"var(--soil)",   sub:"Put money and skills to work: halal and checked."},
  pass:{name:"Pass on", story:"the harvest", color:"var(--harvest)", sub:"Protect what you build and hand it on well."}
};
const LESSONS = [
 {n:1,tr:"keep",c:7,t:"Income is not wealth",idea:"Income is money passing through your hands. Wealth is what stays, works and lasts. Someone earning a lot can still be one bad month away from borrowing.",do:"Write down every source of money that comes into your home each month, and roughly how much.",fam:"Ask everyone at home: what does 'rich' really mean? Listen to each answer.",deep:"Think of someone who earns well but always seems broke, and someone who earns less but is calm about money. What is the difference in how they handle it?"},
 {n:2,tr:"keep",c:14,t:"Where does it all go?",idea:"Most money doesn't disappear in big spends. It leaks in small ones. You can't fix a leak you can't see.",do:"List your fixed monthly costs: rent, school fees, transport, food, data, family support.",fam:"Let each person guess the monthly cost of one thing (food, fuel, data). Compare with the real number.",deep:"Look at last month's bank statement. Circle anything that surprised you."},
 {n:3,tr:"keep",c:30,t:"One week of tracking",idea:"Tracking isn't about guilt. It's about seeing clearly. One week is enough to spot patterns.",do:"Starting today, write down every spend for 7 days. Every one.",fam:"Make it a family game: whoever forgets to log a spend does the dishes.",deep:"At the end of the week, group spends into Needs, Wants and Obligations."},
 {n:4,tr:"keep",c:30,t:"Needs, wants and family obligations",idea:"Supporting parents and relatives is a real obligation for many of us. Plan it, so it doesn't ambush you every month.",do:"Agree a fixed monthly amount for extended-family support, and what happens with requests above it.",fam:"Talk honestly with your spouse about who you each support, and why.",deep:"If you live abroad, decide how much you send home each month, on what date, and how you'll handle emergencies."},
 {n:5,tr:"keep",c:7,t:"Find your seed: your surplus",idea:"Surplus = money in − money out. It's the seed of all wealth. If it's zero, nothing can grow, no matter how much you earn.",do:"Use the Surplus calculator in Tools. Write down your number.",fam:"Share the number with your spouse. No blame. Just ask: how could we make it bigger?",deep:"If your surplus is zero or negative, list two ways to grow it: one cut and one extra income."},
 {n:6,tr:"keep",c:7,t:"Pay your family first",idea:"If you save what's left after spending, there's usually nothing left. Flip it: save first, then live on the rest.",do:"Set a standing order to move a fixed amount on payday into a separate account. Start small, even 5%.",fam:"Give children a simple 'save first' jar: part of any money they receive goes in before they spend.",deep:"Plan to raise the amount by 1% each time your income rises."},
 {n:7,tr:"keep",c:14,t:"Talking about money without fighting",idea:"Many marriage arguments are really money arguments. A calm, regular talk prevents the explosive ones.",do:"Hold a 15-minute money meeting. Each person shares one worry and one hope.",fam:"Agree a regular slot, like Sunday after Asr, for your weekly money talk.",deep:"Agree what each person can spend without asking, and what needs a joint decision."},
 {n:8,tr:"keep",c:30,t:"Halal earning comes first",idea:"Qur'an 4:29 tells believers not to consume each other's wealth unjustly, but through fair trade by mutual consent. Wealth built on what is wrong carries no barakah.",do:"Look at each income source. Is anything doubtful? If so, write down one step to fix it.",fam:"Teach children that how money is earned matters as much as how much.",deep:"Read Qur'an 4:29 with its explanation (tafsir) and reflect on what 'mutual consent' means in your work."},
 {n:9,tr:"last",c:7,t:"Why a cushion comes before investing",idea:"Without a cushion, every emergency forces you to borrow or sell. That digs up the seed before it can grow.",do:"Use the Cushion calculator in Tools. How many months could you last?",fam:"Explain to your family in simple words why you're saving for 'rainy days'.",deep:"List the three emergencies most likely to hit your home in the next year."},
 {n:10,tr:"last",c:14,t:"Open a 'not for spending' account",idea:"Money you can see is money you'll spend. Separate your cushion from your daily money.",do:"Open a separate account or wallet just for emergencies. Name it 'Not for spending'.",fam:"Agree together what counts as a real emergency.",deep:"Choose a halal, easy-to-reach place for it, with no interest-bearing products."},
 {n:11,tr:"last",c:30,t:"Your first target: one month",idea:"Big goals can feel impossible. One month of essentials is a real, reachable first finish line.",do:"Work out a month of essential spending. That's target one. Write it down.",fam:"Put a simple progress chart on the fridge. Colour it in as you save.",deep:"Plan your next targets: three months, then six."},
 {n:12,tr:"last",c:30,t:"Health shocks",idea:"Hospital bills are among the most common reasons families fall back into debt.",do:"Find out what health cover your family has. Price one HMO, insurance or takaful option.",fam:"Make sure everyone knows which hospital to go to and how cover works.",deep:"Learn how takaful differs from conventional insurance, so you can choose with understanding."},
 {n:13,tr:"last",c:7,t:"Every debt on one page",idea:"Debt you don't look at grows quietly. On paper, it becomes a problem you can solve.",do:"List every debt: who, how much, monthly payment, end date.",fam:"If married, go through the list together. No secrets.",deep:"Mark which debts carry interest (riba) and make a plan to clear those first."},
 {n:14,tr:"last",c:30,t:"Stop borrowing to live",idea:"Borrowing for rent or food is the clearest sign of survival mode. Breaking that cycle comes before everything else.",do:"Commit to 30 days without borrowing for normal expenses. Write down what will make it possible.",fam:"Agree as a family which expenses to pause during these 30 days.",deep:"Clear your smallest debt first, then move that payment to the next one."},
 {n:15,tr:"last",c:30,t:"When income falls: the first 48 hours",idea:"A lost job or failed contract is scary. A plan made in calm times stops panic decisions later.",do:"Write a one-page 'if income stops' plan: what to cut first, who to call, what to sell last.",fam:"Share the plan with your spouse so you both know what to do.",deep:"List three skills or contacts that could bring in income quickly if you needed it."},
 {n:16,tr:"grow",c:30,t:"Assets and liabilities",idea:"A simple test: an asset puts money in your pocket. A liability takes money out. A car for business can be an asset. A car for show is usually a liability.",do:"List what you own. Mark each as putting money in, or taking it out.",fam:"Play 'asset or liability?' with your children using everyday things.",deep:"Pick one liability you could turn into an asset, or reduce."},
 {n:17,tr:"grow",c:14,t:"More than investments",idea:"Productive assets include skills, education, business tools, a good reputation and trusted relationships. For many families, these are the best investments available.",do:"Write down three productive assets you already have but don't use fully.",fam:"Ask each person: what is one skill you have that people would pay for?",deep:"Plan how one of those assets could earn something within 90 days."},
 {n:18,tr:"grow",c:30,t:"Your best investment may be you",idea:"A skill grows in value, travels with you anywhere, and can't be stolen.",do:"Choose one skill or certification that would raise your income. Find one way to start learning it.",fam:"Help a child choose a skill they'd like to build this year.",deep:"Work out what that skill could add to your income over 5 years."},
 {n:19,tr:"grow",c:30,t:"Turn a skill into income",idea:"You don't need big capital to start. Many businesses begin with one skill and three customers.",do:"Write down one service you could offer, a fair price, and three people to offer it to this week.",fam:"Involve your children in a small family business project.",deep:"Keep a simple record of money in and money out from day one. Keep business and home money separate."},
 {n:20,tr:"grow",c:14,t:"What makes investing halal?",idea:"Simply put: no interest (riba), no excessive uncertainty or gambling, a permissible business, and profit that comes from real activity with shared risk. A 'guaranteed' return is a warning sign.",do:"Name one halal option you've heard of. Write down what you'd need to check about it.",fam:"Explain to older children why Muslims avoid interest.",deep:"Ask a scholar or a qualified Islamic finance professional one question you're unsure about."},
 {n:21,tr:"grow",c:7,t:"The six-question investment check",idea:"Before sending money anywhere: Who runs it? Does it fit my goal? Can I verify it myself? What could I lose? Is it halal? What are the terms and how do I exit?",do:"Run any offer you've received through the Investment check in Tools.",fam:"Agree a household rule: no investment above an agreed amount without both spouses checking it.",deep:"Look up the regulator where you live (SEC Nigeria, for example) and learn how to check if a firm is registered."},
 {n:22,tr:"grow",c:30,t:"Red flags that cost families everything",idea:"Promised high or guaranteed returns, pressure to decide fast, 'only for our group', paying old members with new members' money, no licence. Many Nigerian families have lost savings this way.",do:"Think of any scheme you've been invited to. How many red flags does it have?",fam:"Share these red flags with your parents and relatives. They're often targeted.",deep:"Read about one collapsed scheme and note which red flags were there from the start."},
 {n:23,tr:"grow",c:30,t:"Start small, stay steady",idea:"Waiting for 'big money' to start investing means never starting. Small, regular amounts over many years beat big, late, rushed decisions.",do:"Choose a small amount you could put into a checked, halal option every month.",fam:"Show children how small regular savings grow over a year.",deep:"Write down your one-year, five-year and ten-year goals."},
 {n:24,tr:"pass",c:7,t:"The 7-day question",idea:"If something happened to you tonight, could your family find everything you own within 7 days? For most homes, honestly, the answer is no.",do:"Take the 7-day test in Tools.",fam:"Ask your spouse: if I wasn't here tomorrow, where would you start?",deep:"List the accounts and assets only you know about."},
 {n:25,tr:"pass",c:30,t:"Write your family asset list",idea:"A simple document listing what you own, where it is, the proof of ownership, and what you owe. It saves your family months of pain.",do:"Start your list: bank accounts, pension, property, business, vehicles, investments, debts.",fam:"Tell your spouse or a trusted person where the list is kept.",deep:"Add key contacts: your employer's HR, bank, pension provider, lawyer."},
 {n:26,tr:"pass",c:30,t:"Next of kin and beneficiaries",idea:"Many family assets get stuck because next-of-kin details are old, wrong or missing.",do:"Check the next-of-kin details on one bank account and your pension. Update if needed.",fam:"Make sure your spouse knows which institutions to contact.",deep:"Do the same for takaful and insurance policies and any investment accounts."},
 {n:27,tr:"pass",c:14,t:"Inheritance and the wasiyyah",idea:"In Islam, the shares of heirs are fixed by the Qur'an. A wasiyyah (will) can direct up to one third to non-heirs and good causes, name a guardian for your children, and record your debts. Laws differ by country, so get proper help.",do:"Book a conversation with a scholar or a lawyer who handles Islamic wills.",fam:"Discuss guardianship for your children with your spouse.",deep:"If you live abroad, ask how local law treats an Islamic will where you live."},
 {n:28,tr:"pass",c:30,t:"Teaching children about money",idea:"Financial knowledge is part of the wealth you pass on. Children learn more from what they see than what they're told.",do:"Have one age-appropriate money talk: earning, saving, giving.",fam:"Under 8: jars for save, spend, give. 8–14: a small budget to manage. Teens: involve them in a real family money decision.",deep:"Let an older child help with the family asset list or budget."},
 {n:29,tr:"pass",c:14,t:"Charity that keeps giving",idea:"Sahih Muslim 1631 teaches that when a person dies, their deeds end except three: ongoing charity, beneficial knowledge, and a righteous child who prays for them. A modest home can begin all three.",do:"Choose one small, regular sadaqah jariyah: a well, a school, a mosque, a Qur'an.",fam:"Let your children choose the cause with you.",deep:"Learn what a waqf (endowment) is and how families pool resources to create one."},
 {n:30,tr:"pass",c:30,t:"Review and recheck",idea:"Wealth is a journey, not a one-off event. Measure, act, and measure again.",do:"Retake the Family Wealth Check. Compare your score with your first one.",fam:"Celebrate what you achieved together, then choose the next 30 days.",deep:"Write your family's money vision for the next five years."}
];
const SITTINGS = [
  {after:"keep", t:"Family sitting: Keep", qs:["What did we learn about where our money goes?","What is our surplus, and how can we grow it?","Which three cuts did we agree, and are they working?","What will we save first, on payday?"]},
  {after:"last", t:"Family sitting: Last", qs:["How many months could we last today?","What's our cushion target and our progress?","What's on our debt page, and which one goes first?","What's our plan if income stops?"]},
  {after:"grow", t:"Family sitting: Grow", qs:["What skills do we have that could earn more?","Is our money working, or sleeping?","Did any offer we received pass the six-question check?","What will we start small and steady?"]},
  {after:"pass", t:"Family sitting: Pass on", qs:["Could we pass the 7-day test now?","Is our asset list written and shared?","Who will look after our children, and is it written in a wasiyyah?","Which sadaqah jariyah have we chosen together?"]}
];

/* =================== CASE STUDY + SLIDES =================== */
const CASE = {
  answers:{country:"NG",band:2,sources:65,steady:60,left:45,first:20,runway:0,cover:50,debtshare:75,borrow:45,where:15,check:5,grow:55,talk:40,docs:["kin"]}
};
function seedCards(f, weak){
  return `<div class="seedgrid">${Object.keys(SEED).map(k=>{
    const s = SEED[k], v = f ? f[k] : null, lw = v!=null ? levelWord(v) : null;
    return `<div class="seedcard${weak===k?" weak":""}" style="--c:${s.color}"><div class="k"><b>${k}</b><span>${s.story}</span></div><h4>${s.name}</h4><p>${s.plain}</p><p class="built"><b>Built from:</b> ${s.built}</p>${lw?`<div class="st" style="color:${lw.c}">${lw.w}${weak===k?" · the weakest link":""}</div>`:""}</div>`;
  }).join("")}</div>`;
}
const caseR = compute(CASE.answers);
const SLIDES = [
  {id:"title", presenter:true, kick:"MSMMI Marriage Workshop 2026 · Day 2", title:"Beyond Survival: Building Wealth and a Generational Muslim Legacy",
   body:()=>`<p>Eb'rahim Durosimi</p><div class="join-qr"><div class="qrbox" data-qr></div><div class="stack"><span class="label">Open SeedLine on your phone</span><span class="join-url">${esc(JOIN.replace(/^https?:\/\//,""))}</span></div></div>`,
   notes:"Welcome. Before I say anything about money, I want every one of you to open this link. We start with you, not with theory."},
  {id:"take", presenter:true, kick:"Step 1 · 6 minutes", title:"Before I teach anything, let's find out where you are.",
   body:()=>`<p>Twenty quick questions. No exact figures. Completely anonymous. You'll get a score from 0 to 100 and see which part of your money is holding you back.</p><div class="join-qr"><div class="qrbox" data-qr></div><span class="join-url">${esc(JOIN.replace(/^https?:\/\//,""))}</span></div>`,
   notes:"Give them 4–5 minutes. Encourage couples to do it together on one phone. Then move to the live board."},
  {id:"room", presenter:true, kick:"Live", title:"This is where our room stands right now", body:()=>`<div data-room></div>`,
   notes:"Read the board out loud. Where is the biggest cluster? What is the most common weakest part? Say: nobody here is being judged. This is a starting line."},
  {id:"stages", kick:"What your score means", title:"Four stages, from surviving to legacy",
   body:()=>`<div class="stagecards">${STAGES.map((s,i)=>`<div style="--c:${s.color}"><small>${s.min}–${STAGES[i+1]?STAGES[i+1].min-1:100}</small><b>${s.name}</b><span>${s.means}</span></div>`).join("")}</div><p>The score is a teaching indicator, not a verdict. It shows where to focus next.</p>`,
   notes:"Ask: who is in Stabilising? This is where most homes sit: not in crisis, but not shock-proof."},
  {id:"words", kick:"Five money words", title:"Income is not wealth",
   body:()=>`<div class="words">
     <div class="word"><b>Income</b><span>Money that comes in. A flow, like water through a pipe.</span></div>
     <div class="word"><b>Savings</b><span>Money you kept and put aside.</span></div>
     <div class="word"><b>Assets</b><span>Things you own that have value or earn money: a business, a skill, property, investments.</span></div>
     <div class="word"><b>Debt</b><span>Money you owe. A claim on your future income.</span></div>
     <div class="word hero"><b>Wealth</b><span>What you own minus what you owe, that keeps working and lasting, even when income stops.</span></div>
   </div>`,
   notes:"Key line: income tells me how much passes through your hands. Wealth tells me how much stays."},
  {id:"compare", kick:"Same city, different stories", title:"Who is wealthier?",
   body:()=>`<div class="compare">
     <div><span class="label">Home A</span><span class="fig">Earns ₦1,000,000</span><span class="fig">Spends ₦950,000</span><span class="big">Keeps ₦50k</span></div>
     <div><span class="label">Home B</span><span class="fig">Earns ₦700,000</span><span class="fig">Spends ₦550,000</span><span class="big">Keeps ₦150k</span></div>
   </div><p>Home B earns less but keeps three times more. In the check, you told us your income band. <strong>It's not in your score at all.</strong> This isn't about blaming low earners: for some homes, the fix is cutting; for many, it's earning more.</p>`,
   notes:"Pause. Let it land. Then: wealth starts with what happens to the surplus."},
  {id:"seed", kick:"The seed story", title:"How wealth grows: seed, season, soil, harvest",
   body:()=>seedCards(null),
   notes:"Farmers understand this. Without a seed, nothing. Dig it up early, nothing. Plant it in a drawer, nothing. Lose the harvest, nothing for the next generation."},
  {id:"maths", kick:"The maths behind it", title:"W = S × T × P × G",
   body:()=>`<div class="formula"><b>W</b><span class="op">=</span><b style="color:var(--seed)">S</b><span class="op">×</span><b style="color:var(--season)">T</b><span class="op">×</span><b style="color:var(--soil)">P</b><span class="op">×</span><b style="color:var(--harvest)">G</b></div>
     <p><strong>Wealth = Surplus × Time × Productive use × Good stewardship.</strong> It's multiplication, not addition. If any one of them is zero, the answer is zero. A big income with no surplus builds nothing. Savings in a drawer build nothing. A fortune without a will can vanish in one generation.</p><p>This is a teaching model, not a formula for predicting returns.</p>`,
   notes:"This is the mathematician's moment. Ask: what's 1,000,000 × 0? Then: which of your four is closest to zero?"},
  {id:"bakare", kick:"Meet the Bakare family · Lagos", title:"Tunde and Rukayat",
   body:()=>`<p>Tunde works in logistics on a salary. Rukayat runs a small catering business: good months and slow months. Two children, aged 8 and 5. Tunde sends money to his mother every month.</p>
     <div class="familybox"><div><b>Money in</b><span>₦850,000</span></div><div><b>Basics each month</b><span>₦610,000</span></div><div><b>Loan repayments</b><span>₦80,000</span></div><div><b>Emergency savings</b><span>₦250,000</span></div></div>
     <p>On paper, about ₦100,000 is left each month. In practice, it disappears. Savings sit in a current account. Last week, a friend added Tunde to a WhatsApp group promising 10% a month.</p>`,
   notes:"Make them real. Ask: does anyone know a family like this? Most hands go up."},
  {id:"bakare-score", kick:"The Bakares take the check", title:`${caseR.score} out of 100 · ${caseR.stage.name}`,
   body:()=>`<p>Just over the line into Stabilising, but one shock away from going back. Here is their seed story:</p>${seedCards(caseR.factors, Object.keys(caseR.factors).sort((x,y)=>caseR.factors[x]-caseR.factors[y])[0])}
     <p>Their cushion: ₦250,000 ÷ ₦610,000 a month = <strong>about 12 days</strong>. One hospital bill, and they borrow. Rukayat doesn't know where Tunde's pension details are kept. There's no wasiyyah.</p>`,
   notes:"Ask the room: what would knock this family down fastest? Let 2–3 people answer."},
  {id:"whatsapp", kick:"The WhatsApp offer", title:"10% a month, guaranteed. Should Tunde invest?",
   body:()=>`<div class="redflags">
     ${[["I","Who runs it? Only 'a friend of a friend'. Can't find the company."],["N","Does it fit their goal? They need a cushion, not a gamble."],["V","Licensed by SEC Nigeria? No registration found."],["E","Could they lose it all? Yes, and it's their only savings."],["S","Halal? A guaranteed return is not profit-sharing. Red flag."],["T","How do they get money out? 'After 6 months, if you bring 2 people.'"]].map(([k,t])=>`<div><i style="background:var(--survive)">${k}</i><span><strong>${k}</strong> · ${t}</span></div>`).join("")}
   </div><p><strong>Verdict: walk away.</strong> Calling something Islamic doesn't remove the need to check it. Three questions are separate: May I? (halal) · Should I? (suitable for my home) · Can I trust it? (credible).</p>`,
   notes:"Take a vote first: hands up who would invest? Then go through I.N.V.E.S.T. The investment check is in the app under Tools."},
  {id:"bakare-plan", kick:"The Bakares' plan", title:"Fix now. Grow next. Protect for later.",
   body:()=>`<div class="words">
     <div class="word"><b>Fix now</b><span>Open a 'not for spending' account. ₦50,000 moves there automatically every payday. Target: one month of basics.</span></div>
     <div class="word"><b>Grow next</b><span>Rukayat separates business and home money and keeps simple records, so the business can grow and get halal financing.</span></div>
     <div class="word"><b>Protect for later</b><span>Write a family asset list together. Tunde shows Rukayat where everything is. They book a conversation about a wasiyyah.</span></div>
   </div><p>In 90 days, their cushion goes from 12 days to about 3 weeks. Not dramatic. But the habit is built, the seed is protected, and the family knows where everything is.</p>`,
   notes:"Stress realism. No get-rich promises. Habits first."},
  {id:"faith", kick:"Where faith shapes money", title:"How it's earned. What it serves. What continues.",
   body:()=>`<div class="quote"><p>Do not consume one another's wealth unjustly, but trade by mutual consent.</p><cite>Meaning of Qur'an 4:29</cite></div>
     <div class="quote"><p>When a person dies, their deeds end except three: ongoing charity, beneficial knowledge, or a righteous child who prays for them.</p><cite>Meaning of Sahih Muslim 1631</cite></div>
     <p>Halal earning → careful spending → productive investing → protecting the family → benefit that continues. A modest home can begin all three of the things that continue, starting this month.</p>`,
   notes:"These are meanings, not verbatim translations. Individual inheritance questions need a scholar or lawyer."},
  {id:"sevenday", kick:"The uncomfortable question", title:"If something happened to you tonight, could your family find everything you own within 7 days?",
   body:()=>`<div class="words">
     <div class="word"><b>Locate</b><span>What do we own, and where is it?</span></div>
     <div class="word"><b>Prove</b><span>Can we show it's ours? Documents, titles, statements.</span></div>
     <div class="word"><b>Direct</b><span>Is there a wasiyyah, a guardian, updated next of kin?</span></div>
     <div class="word"><b>Benefit</b><span>What keeps doing good after we're gone?</span></div>
   </div>`,
   notes:"Let the silence sit for five seconds. Then point them to the 7-day test in Tools."},
  {id:"yourplan", presenter:true, kick:"Your turn · 5 minutes", title:"Open your plan. Choose one Fix, one Grow, one Protect.",
   body:()=>`<p>In the app, tap <strong>Plan</strong>. Your actions are already ordered by what's weakest for you. Each one tells you why it matters, what to do this week, and how you'll know it's done.</p><p>Do it with your spouse if they're here.</p>`,
   notes:"Walk around the room virtually: ask 2 volunteers to share their Fix action in the chat."},
  {id:"course", kick:"After today", title:"The journey continues: From Surviving to Building",
   body:()=>`<p>A short course that fits your life. Choose how long (7, 14 or 30 lessons), how often, how many minutes a day, alone or with your family. Get reminders on your phone, by email or by calendar.</p>
     <div class="words">${Object.values(TRACKS).map(t=>`<div class="word" style="border-top:4px solid ${t.color}"><b>${t.name}</b><span>${t.sub}</span></div>`).join("")}</div>`,
   notes:"Invite everyone to start the course tonight. Their plan and progress save on their phone."},
  {id:"close", kick:"Three actions to leave with", title:"Fix one thing. Grow one thing. Protect one thing.",
   body:()=>`<p>Stabilise what you have. Build what will serve. Document what must endure. Then come back in 30 days, retake the check, and see your number move.</p><div class="join-qr"><div class="qrbox" data-qr></div><span class="join-url">${esc(JOIN.replace(/^https?:\/\//,""))}</span></div>`,
   notes:"Close and hand over to the moderator. JazakumAllahu khayran."}
];


export { STAGES, stageOf, PARTS, TIE, WEIGHTS, SEED, CUR, Q, SCORED, compute, levelWord, BUCKETS, ACTIONS, roadmap, TRACKS, LESSONS, SITTINGS, CASE, caseR, SLIDES, seedCards };

export const REFS = {
 1:["Qur'an 17:26–27 (meaning): give to relatives and the poor, and do not waste","General household finance practice"],
 2:["General household finance practice"],
 3:["General household finance practice"],
 4:["Qur'an 2:215 (meaning): spending on parents, relatives and those in need"],
 5:["Qur'an 25:67 (meaning): neither extravagant nor stingy, but balanced"],
 6:["General household finance practice: pay yourself first"],
 7:["Qur'an 42:38 (meaning): affairs settled by mutual consultation"],
 8:["Qur'an 4:29 (meaning): no unjust taking of wealth; trade by mutual consent"],
 9:["Qur'an 12:47–49 (meaning): Yusuf stores grain in years of plenty for years of hardship"],
 10:["Qur'an 12:47–49 (meaning)","General household finance practice"],
 11:["Qur'an 12:47–49 (meaning)","General household finance practice"],
 12:["Takaful principles: shared, mutual protection","Nigeria: NHIA and HMO health cover"],
 13:["Qur'an 2:282 (meaning): write down debts with a clear term"],
 14:["Hadith: the Prophet ﷺ sought refuge in Allah from heavy debt (Sahih al-Bukhari)","Qur'an 2:280 (meaning): ease for those in difficulty"],
 15:["General household finance practice"],
 16:["General finance practice: assets and liabilities"],
 17:["General finance practice: human and productive capital"],
 18:["General finance practice: human capital"],
 19:["Qur'an 62:10 (meaning): go out and seek Allah's bounty"],
 20:["Qur'an 2:275 (meaning): trade is permitted and riba forbidden","AAOIFI Shariah Standards (general overview)"],
 21:["SEC Nigeria investor education","The I.N.V.E.S.T. checklist used in this course"],
 22:["SEC Nigeria public warnings about unregistered investment schemes"],
 23:["Hadith: the most beloved deeds are those done consistently, even if small (Sahih al-Bukhari, Sahih Muslim)"],
 24:["Qur'an 2:282 (meaning): writing things down protects everyone"],
 25:["Qur'an 2:282 (meaning)"],
 26:["General estate practice in Nigeria: next of kin and beneficiaries"],
 27:["Qur'an 4:11–12 (meaning): the fixed shares of inheritance","Hadith: a bequest is limited to one third (Sahih al-Bukhari, Sahih Muslim)"],
 28:["Sahih al-Bukhari 7138 (meaning): each of you is responsible for those in your care"],
 29:["Sahih Muslim 1631 (meaning): ongoing charity, beneficial knowledge, a righteous child"],
 30:["General practice: measure, act, measure again"]
};
export const APPROVAL = {by:"Eb'rahim Durosimi", date:"15 November 2026", note:"Qur'an and hadith are given as meanings, not verbatim translations. For personal rulings, especially inheritance, consult a qualified scholar."};

/* Turns "{20}" into a real amount in the family's currency, e.g. ₦20,000 of every ₦100,000. */
const UNIT = { NG:["₦",100000], US:["$",1000], UK:["£",1000], OTHER:["$",1000] };
export function money(text, country){ if (!text) return text; const [sym, unit] = UNIT[country || "NG"] || UNIT.NG;
  return text.replace(/\{(\d+)\}/g, (_, p) => sym + Math.round(unit * (+p) / 100).toLocaleString("en-NG")); }
