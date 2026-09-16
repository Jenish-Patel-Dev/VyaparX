import { Language } from '../i18n/translations';

export interface PageInfoGuide {
  title: string;
  whatIsThis: string;
  whatToDo: string[];
  tips?: string;
}

export const UI_GUIDE_STRINGS: Record<Language, {
  badge: string;
  whatIsThis: string;
  whatToDo: string;
  proTip: string;
  gotIt: string;
}> = {
  en: {
    badge: 'PAGE HELP & INFO GUIDE',
    whatIsThis: 'What is on this page?',
    whatToDo: 'What to do on this page?',
    proTip: 'Pro-Tip',
    gotIt: 'Got It',
  },
  hi: {
    badge: 'पेज सहायता एवं जानकारी',
    whatIsThis: 'इस पेज में क्या है?',
    whatToDo: 'इस पेज में क्या करना है?',
    proTip: 'महत्वपूर्ण सुझाव',
    gotIt: 'समझ गया',
  },
  gu: {
    badge: 'પેજ સહાય અને માહિતી માર્ગદર્શિકા',
    whatIsThis: 'આ પેજમાં શું છે?',
    whatToDo: 'આ પેજમાં શું કરવું?',
    proTip: 'મહત્વપૂર્ણ સલાહ',
    gotIt: 'સમજાઈ ગયું',
  },
};

// Simple English Guides (Primary & Default)
const EN_GUIDES: Record<string, PageInfoGuide> = {
  'ADD PARTY': {
    title: 'ADD PARTY GUIDE',
    whatIsThis: 'This form is used to register a new Buyer, Seller, or Broker party in your business network.',
    whatToDo: [
      'Select Party Type: Choose whether this party is a Buyer, Seller, or Both.',
      'Enter Mandatory Details: Party Name, 10-digit Mobile Number, State, and City are required (*).',
      'Add Optional Details: Enter Address, GST Number, PAN, and Bank details if available.',
      'Save Party: Click the "Save Party" button at the bottom to register the party.',
    ],
    tips: 'Enter a valid 10-digit mobile number so you can directly send trade confirmations via WhatsApp.',
  },
  'EDIT PARTY': {
    title: 'EDIT PARTY GUIDE',
    whatIsThis: 'This page allows you to view and update existing party contact details, address, or bank information.',
    whatToDo: [
      'Modify the fields you want to update (such as Mobile, City, Address).',
      'Ensure required fields (Party Name, Mobile, State, City) are not left empty.',
      'Use the delete icon in the top right corner if you want to remove an unused party.',
      'Click "Update Party" at the bottom to save your changes.',
    ],
    tips: 'Updating party details will not alter your past order history.',
  },
  'PARTIES': {
    title: 'PARTIES DIRECTORY GUIDE',
    whatIsThis: 'A centralized directory of all your registered Buyers and Sellers.',
    whatToDo: [
      'Search: Quickly find any party by Name, Mobile Number, City, State, Address, Email, or GST Number.',
      'Reset Search: Tap the Reset button (icon on mobile, button on desktop) to instantly clear search and restore all parties.',
      'View & Edit: Tap on any party card to view full details or make edits.',
      'Direct Call: Tap the phone icon on any card to call the party directly.',
      'Add Party: Tap the "+" button at the bottom right to register a new party.',
    ],
    tips: 'Search works across Party Name, Mobile, City, State, Address, Email, and GST number.',
  },

  'ADD ITEM': {
    title: 'ADD ITEM GUIDE',
    whatIsThis: 'Use this form to register a new commodity item (such as Cotton, Kapas, Khol, Jeera, Oil, etc.).',
    whatToDo: [
      'Enter Item Name: Provide a clear commodity name (e.g., COTTON 29MM, KAPAS SHANKAR).',
      'Select Default Unit: Choose your standard unit (Bales, Bags, Quintal, Kg, or Candy).',
      'Set Packing & Rate: Enter standard packing size and market rate.',
      'Save Item: Click "Save Item" to add this commodity to your catalog.',
    ],
    tips: 'Items added here will appear in the dropdown when creating a new trade order.',
  },
  'EDIT ITEM': {
    title: 'EDIT ITEM GUIDE',
    whatIsThis: 'Modify commodity item names, packing specifications, or standard market rates.',
    whatToDo: [
      'Update item name, packing unit, or standard rates as needed.',
      'Use the delete icon in the top right to remove items that are no longer traded.',
      'Click "Update Item" to save your updates.',
    ],
    tips: 'Choose the correct unit as all order calculations rely on this measurement.',
  },
  'ITEM DETAIL': {
    title: 'COMMODITY ITEMS GUIDE',
    whatIsThis: 'Catalog of all commodity items traded by your firm.',
    whatToDo: [
      'Search: Quickly find any commodity item by its name using the search bar.',
      'Reset Search: Tap the Reset button (icon on mobile, button on desktop) to instantly clear search and restore all items.',
      'Edit: Tap on any commodity card to modify its rates or units.',
      'Add New: Tap the floating "+" button at the bottom right to add a new commodity product.',
    ],
    tips: 'Use the Reset button next to the search bar to quickly clear search filters.',
  },

  'CREATE VYAPAR ORDER': {
    title: 'CREATE VYAPAR GUIDE',
    whatIsThis: 'A 3-step wizard to record and confirm a new commodity trade order.',
    whatToDo: [
      'Step 1 (Item & Quality): Select the commodity item, enter rate, quantity, and weight unit.',
      'Step 2 (Parties): Select Seller (supplier) and Buyer (purchaser). Both parties must be different.',
      'Step 3 (Delivery & Terms): Specify delivery conditions, payment days, and brokerage rate.',
      'Confirm & Share: Save the order to instantly generate and share confirmation slips on WhatsApp.',
    ],
    tips: 'Complete Step 1 and Step 2 to unlock the final Delivery & Payment step.',
  },
  'EDIT VYAPAR': {
    title: 'EDIT VYAPAR GUIDE',
    whatIsThis: 'Review and modify details of an already booked trade contract.',
    whatToDo: [
      'Navigate through the steps to adjust rates, quantities, or delivery terms.',
      'Use the delete button in the top right to cancel the order if needed.',
      'Click "Update Sauda" to save revisions and regenerate confirmation slips.',
    ],
    tips: 'Any updates will be reflected in your financial year brokerage reports immediately.',
  },
  'VYAPAR': {
    title: 'VYAPAR ORDERS GUIDE',
    whatIsThis: 'Central dashboard displaying all active, completed, and pending trade orders with comprehensive multi-field search and filters.',
    whatToDo: [
      'Search: Search orders from the search bar by DO Number (#DO), Commodity Item Name, Seller Name, Pickup Location/City, Buyer Name, or Drop Location/City.',
      'Filter Modal: Tap the filter button next to the search bar to filter by Date (using calendar picker), Commodity Item LOV, or Party LOV (Seller/Buyer).',
      'Reset All: Tap the Reset button (icon on mobile, label+icon on desktop) to instantly clear the search bar and all popup filters, restoring all orders.',
      'Active Filters: Quickly view or dismiss individual active filter tags shown right below the search bar.',
      'View & Share: Tap any order card to see full contract notes or share via WhatsApp.',
      'New Order: Tap the floating "+" button at the bottom right to record a new trade order.',
    ],
    tips: 'Use the Reset button anytime to quickly clear search text and all active filters in a single tap.',
  },
  'VYAPAR BILLS & NOTES': {
    title: 'BILLS & CONFIRMATION NOTES GUIDE',
    whatIsThis: 'Generate official printable trade confirmation notes and brokerage contracts with multi-field search and filters.',
    whatToDo: [
      'Search Orders: Search orders by DO Number, Commodity Item, Seller, Buyer, Pickup/Drop location, or City.',
      'Filter Modal: Tap the filter button to filter orders by Date (calendar picker), Commodity Item, or Party (Seller/Buyer).',
      'Reset All: Tap the Reset button (icon on mobile, label+icon on desktop) to instantly clear search and all filters.',
      'Select Order: Tap on any order card from the list to preview its formal trade note.',
      'Select Template & Color: Choose your preferred template (1-4) and brand note color.',
      'Print / Save PDF: Print formal paper copies or download PDF notes for buyers and sellers.',
    ],
    tips: 'Use the search and filter tools to instantly find specific trade notes for printing or sharing.',
  },

  'COMPANIES': {
    title: 'COMPANIES LIST GUIDE',
    whatIsThis: 'Manage and switch between multiple business firms and brokerage accounts.',
    whatToDo: [
      'Search: Search and filter firms by Company Name, Username, Email, Address, or City.',
      'Reset Search: Tap the Reset button (icon on mobile, button on desktop) to instantly clear search and view all companies.',
      'Switch Company: Tap on any firm card to set it as your Active Company.',
      'Edit Profile: Tap edit to update company address, phone, or registration.',
      'Add Firm: Tap the "+" button to register an additional company profile.',
    ],
    tips: 'Use the search bar and Reset button to quickly locate firms across multiple accounts.',
  },
  'ADD COMPANY': {
    title: 'ADD COMPANY GUIDE',
    whatIsThis: 'Register a new firm or company profile in your VyaparX account.',
    whatToDo: [
      'Enter Firm Name: Provide the official registered trade name of your firm.',
      'Contact & Address: Enter business address, phone number, and GSTIN.',
      'Header & Footer: Define custom header and footer text for your trade confirmation notes.',
      'Save: Click "Save Company" to register the firm.',
    ],
    tips: 'The header and footer text will automatically appear on all printable sauda notes.',
  },
  'EDIT COMPANY': {
    title: 'EDIT COMPANY GUIDE',
    whatIsThis: 'Update your firm details, branding preferences, and note templates.',
    whatToDo: [
      'Update business address, contact numbers, and tax identifiers.',
      'Customize bill colors and template layouts.',
      'Click "Save Changes" to apply updates across all printed slips.',
    ],
    tips: 'Changes apply immediately to all upcoming trade confirmation notes.',
  },
  'CREATE YOUR FIRST COMPANY': {
    title: 'FIRST COMPANY SETUP GUIDE',
    whatIsThis: 'Set up your primary brokerage firm to unlock all VyaparX features.',
    whatToDo: [
      'Enter your business firm name and contact details.',
      'Select your State and City.',
      'Click "Create Company" to begin trading.',
    ],
    tips: 'You can add more companies later from the Companies menu.',
  },

  'BROKERAGE TOTAL AMOUNT REPORT': {
    title: 'BROKERAGE REPORT GUIDE',
    whatIsThis: 'A summary of brokerage earnings and party-wise trade volumes for the active year.',
    whatToDo: [
      'Review party-wise total turnover, quantities, and brokerage earned.',
      'Tap the Print icon in the top right to download or print a formal statement.',
    ],
    tips: 'Switch financial years from the profile or home page to view previous years\' earnings.',
  },

  'MANAGE QUICK VALUES': {
    title: 'QUICK VALUES GUIDE',
    whatIsThis: 'Create one-click presets for repetitive terms, delivery conditions, and remarks.',
    whatToDo: [
      'Add delivery conditions (e.g., Ready Delivery, 7 Days, Ex-Godown).',
      'Add payment terms (e.g., RTGS within 5 days, Immediate Cash).',
      'Select a category and tap "+" to save a new shortcut.',
    ],
    tips: 'These shortcuts appear as one-tap chips during order creation, saving you typing time.',
  },
  'SECURITY & PIN': {
    title: 'SECURITY & PIN GUIDE',
    whatIsThis: 'Protect your business data and trade records with a 4 or 6-digit security PIN.',
    whatToDo: [
      'Set a new security PIN and confirm it.',
      'Enable app lock to require PIN entry upon opening the app.',
      'Use the reset option if you ever need to change your PIN.',
    ],
    tips: 'PIN security ensures your confidential client rates and commissions remain private.',
  },
  'REFERRALS & REWARDS': {
    title: 'REFER & EARN GUIDE',
    whatIsThis: 'Invite fellow commodity brokers and traders to earn free premium access.',
    whatToDo: [
      'Share your unique referral code with fellow brokers on WhatsApp.',
      'When they sign up, both of you receive 30 bonus days of free access.',
    ],
    tips: 'There is no limit on referrals — invite more peers to extend your free access.',
  },
  'MY PROFILE': {
    title: 'MY PROFILE GUIDE',
    whatIsThis: 'Manage your personal broker profile, company preferences, and app settings.',
    whatToDo: [
      'Switch Active Company and Financial Year.',
      'Toggle between Dark Mode and Light Mode.',
      'Change App Language (English, Hindi, Gujarati).',
      'Configure security PIN, backup, and quick values.',
    ],
    tips: 'Changing the app language will immediately translate all screens and guides.',
  },
};

// Hindi Guides
const HI_GUIDES: Record<string, PageInfoGuide> = {
  'ADD PARTY': {
    title: 'पार्टी जोड़ने की मार्गदर्शिका',
    whatIsThis: 'अपने व्यापार नेटवर्क में नए खरीदार (Buyer), विक्रेता (Seller) या दोनों को जोड़ने का फॉर्म।',
    whatToDo: [
      'पार्टी प्रकार चुनें: Buyer, Seller या Both.',
      'अनिवार्य फ़ील्ड भरें: पार्टी का नाम, 10 अंकों का मोबाइल नंबर, राज्य और शहर (*).',
      'वैकल्पिक विवरण: पता, GSTIN, PAN और बैंक विवरण भरें।',
      'पार्टी सहेजें: नीचे दिए गए "Save Party" बटन पर टैप करें।',
    ],
    tips: '10 अंकों का सही मोबाइल नंबर डालें ताकि सौदा पुष्टिकरण सीधे WhatsApp पर भेजा जा सके।',
  },
  'EDIT PARTY': {
    title: 'पार्टी विवरण सुधार मार्गदर्शिका',
    whatIsThis: 'मौजूदा पार्टी के संपर्क नंबर, पते या बैंक विवरण को अपडेट करने का पेज।',
    whatToDo: [
      'जिन फ़ील्ड्स को बदलना हो उन्हें संशोधित करें।',
      'अनिवार्य फ़ील्ड (नाम, मोबाइल, राज्य, शहर) को खाली न छोड़ें।',
      'यदि अप्रयुक्त पार्टी को हटाना हो तो ऊपर दाईं ओर डिलीट आइकन का उपयोग करें।',
      'बदलावों को सहेजने के लिए "Update Party" पर क्लिक करें।',
    ],
    tips: 'पार्टी अपडेट करने से आपके पुराने सौदों के रिकॉर्ड सुरक्षित रहते हैं।',
  },
  'PARTIES': {
    title: 'पार्टी सूची मार्गदर्शिका',
    whatIsThis: 'आपके सभी पंजीकृत खरीदारों और विक्रेताओं की पूरी डायरेक्टरी।',
    whatToDo: [
      'खोजें: सर्च बार में नाम, मोबाइल नंबर, शहर, राज्य, पता, ईमेल या GST नंबर डालकर किसी भी पार्टी को तुरंत ढूंढें।',
      'सर्च रीसेट करें: सर्च क्लियर करने और सभी पार्टियां वापस देखने के लिए रीसेट बटन का उपयोग करें।',
      'देखें और संपादित करें: पार्टी कार्ड पर टैप करके पूरा विवरण देखें या एडिट करें।',
      'सीधा कॉल: पार्टी को सीधे फोन लगाने के लिए फोन आइकन पर टैप करें।',
      'नई पार्टी: नीचे दाईं ओर "+" बटन दबाकर नई पार्टी जोड़ें।',
    ],
    tips: 'सर्च अब नाम, मोबाइल, शहर, राज्य, पता, ईमेल और GST नंबर सभी फ़ील्ड्स पर काम करता है।',
  },
  'ADD ITEM': {
    title: 'नया आइटम जोड़ने की मार्गदर्शिका',
    whatIsThis: 'नया कमोडिटी उत्पाद (जैसे कपास, कॉटन बेल्स, खौल, जीरा, तेल आदि) दर्ज करने का फॉर्म।',
    whatToDo: [
      'आइटम का नाम दर्ज करें (उदा. COTTON 29MM, KAPAS SHANKAR).',
      'डिफ़ॉल्ट इकाई चुनें (गांठ/Bales, बैग/Bags, क्विंटल/Quintal, किलो/Kg).',
      'पैकिंग साइज और मानक दर दर्ज करें।',
      '"Save Item" बटन पर क्लिक करके आइटम को कैटलॉग में जोड़ें।',
    ],
    tips: 'यहाँ जोड़े गए आइटम नया सौदा बनाते समय ड्रॉपडाउन में दिखाई देंगे।',
  },
  'EDIT ITEM': {
    title: 'आइटम सुधार मार्गदर्शिका',
    whatIsThis: 'कमोडिटी आइटम का नाम, पैकिंग विवरण या मानक बाजार दर बदलने का पेज।',
    whatToDo: [
      'ज़रूरत के अनुसार आइटम का नाम, इकाई या दर अपडेट करें।',
      'जो आइटम अब ट्रेड नहीं होता उसे ऊपर दाईं ओर डिलीट बटन से हटाएं।',
      '"Update Item" पर क्लिक करके बदलाव सुरक्षित करें।',
    ],
    tips: 'सही इकाई चुनें क्योंकि सौदे की पूरी गणना इसी पर निर्भर करती है।',
  },
  'ITEM DETAIL': {
    title: 'कमोडिटी आइटम सूची मार्गदर्शिका',
    whatIsThis: 'आपकी फर्म द्वारा ट्रेड किए जाने वाले सभी कमोडिटी उत्पादों का कैटलॉग।',
    whatToDo: [
      'सर्च: सर्च बार में आइटम का नाम टाइप करके किसी भी कमोडिटी को तुरंत खोजें।',
      'रीसेट बटन: सर्च तुरंत साफ़ करने और सभी आइटम्स देखने के लिए रीसेट बटन (मोबाइल पर आइकन, डेस्कटॉप पर बटन) दबाएं।',
      'संशोधन: किसी भी कार्ड पर टैप करके दरें या इकाइयां संशोधित करें।',
      'नया आइटम: नया कमोडिटी उत्पाद जोड़ने के लिए नीचे दिए फ्लोटिंग "+" बटन का उपयोग करें।',
    ],
    tips: 'सर्च बार के बगल में दिए रीसेट बटन से सर्च फ़िल्टर एक क्लिक में साफ़ हो जाता है।',
  },
  'CREATE VYAPAR ORDER': {
    title: 'व्यापार सौदा बनाने की मार्गदर्शिका',
    whatIsThis: 'नया कमोडिटी सौदा ऑर्डर दर्ज करने का 3-चरणीय विज़ार्ड फॉर्म।',
    whatToDo: [
      'चरण 1 (आइटम और दर): कमोडिटी आइटम, भाव, मात्रा और वजन इकाई चुनें।',
      'चरण 2 (पार्टियाँ): विक्रेता (Seller) और खरीदार (Buyer) चुनें। दोनों अलग होने चाहिए।',
      'चरण 3 (डिलीवरी और शर्तें): डिलीवरी की शर्तें, भुगतान अवधि और ब्रोकरेज तय करें।',
      'सहेजें और साझा करें: सौदा सहेजें और तुरंत WhatsApp पर पुष्टिकरण पर्ची भेजें।',
    ],
    tips: 'चरण 1 और चरण 2 पूरा करने के बाद ही डिलीवरी व भुगतान का चरण अनलॉक होता है।',
  },
  'EDIT VYAPAR': {
    title: 'व्यापार सौदा सुधार मार्गदर्शिका',
    whatIsThis: 'पहले से बने हुए सौदे के भाव, मात्रा या डिलीवरी शर्तों में संशोधन करें।',
    whatToDo: [
      'सौदे के चरणों में जाकर आवश्यक विवरण संशोधित करें।',
      'यदि सौदा रद्द करना हो तो ऊपर दाईं ओर डिलीट आइकन का उपयोग करें।',
      '"Update Sauda" पर क्लिक करके नई पर्ची जनरेट करें।',
    ],
    tips: 'कोई भी संशोधन वित्तीय वर्ष की ब्रोकरेज रिपोर्ट में तुरंत अपडेट हो जाता है।',
  },
  'VYAPAR': {
    title: 'व्यापार सौदे सूची मार्गदर्शिका',
    whatIsThis: 'कंपनी के सभी चालू, पूर्ण और लंबित सौदों का मुख्य डैशबोर्ड जिसमें मल्टी-फ़ील्ड सर्च और फ़िल्टर उपलब्ध हैं।',
    whatToDo: [
      'मल्टी-फ़ील्ड सर्च: DO नंबर (#DO), कमोडिटी आइटम का नाम, विक्रेता का नाम, पिकअप लोकेशन/शहर, खरीदार का नाम, या ड्रॉप लोकेशन/शहर से खोजें।',
      'फ़िल्टर पॉपअप: सर्च बार के बगल में फ़िल्टर बटन दबाकर दिनांक (कैलेंडर पिकर), कमोडिटी आइटम LOV, या पार्टी LOV (विक्रेता/खरीदार) के आधार पर फ़िल्टर करें।',
      'रीसेट बटन: सर्च बार और सभी पॉपअप फ़िल्टर को एक क्लिक में रीसेट करने के लिए रीसेट बटन (मोबाइल पर आइकन, डेस्कटॉप पर आइकन + लेबल) का उपयोग करें।',
      'सक्रिय फ़िल्टर: सर्च बार के नीचे दिखने वाले फ़िल्टर टैग से किसी भी फ़िल्टर को सीधे हटा सकते हैं।',
      'सौदा देखें और साझा करें: किसी भी कार्ड पर टैप करके पूरा विवरण देखें या WhatsApp पर PDF पर्ची भेजें।',
      'नया सौदा: नया व्यापार ऑर्डर बनाने के लिए नीचे दाईं ओर फ्लोटिंग "+" बटन पर टैप करें।',
    ],
    tips: 'सर्च और फ़िल्टर हटाने के लिए रीसेट बटन पर टैप करें जिससे तुरंत सभी सौदे दिखने लगेंगे।',
  },
  'VYAPAR BILLS & NOTES': {
    title: 'व्यापार बिल एवं नोट्स मार्गदर्शिका',
    whatIsThis: 'प्रिंट करने योग्य औपचारिक व्यापार अनुबंध और पुष्टिकरण पर्चियां तैयार करें जिसमें मल्टी-फ़ील्ड सर्च और फ़िल्टर उपलब्ध हैं।',
    whatToDo: [
      'सर्च ऑर्डर्स: DO नंबर (#DO), कमोडिटी आइटम, विक्रेता, खरीदार, पिकअप/ड्रॉप लोकेशन या शहर से ऑर्डर खोजें।',
      'फ़िल्टर पॉपअप: दिनांक (कैलेंडर पिकर), कमोडिटी आइटम LOV, या पार्टी LOV (विक्रेता/खरीदार) के अनुसार फ़िल्टर करें।',
      'रीसेट बटन: सर्च और सभी फ़िल्टर एक क्लिक में हटाने के लिए रीसेट बटन (मोबाइल पर आइकन, डेस्कटॉप पर आइकन + लेबल) का उपयोग करें।',
      'ऑर्डर चुनें: सूची में से किसी भी ऑर्डर पर टैप करके उसकी औपचारिक सौदा पर्ची देखें।',
      'टेम्पलेट और रंग: पसंदीदा टेम्पलेट डिज़ाइन (1-4) और ब्रांडिंग रंग चुनें।',
      'प्रिंट या PDF: पेपर प्रिंट निकालें या खरीदार और विक्रेता के लिए PDF डाउनलोड करें।',
    ],
    tips: 'सर्च और फ़िल्टर टूल्स की मदद से किसी भी सौदे की प्रिंट पर्ची तुरंत ढूंढें।',
  },
  'COMPANIES': {
    title: 'कंपनियां सूची मार्गदर्शिका',
    whatIsThis: 'अपनी एकाधिक फर्मों और व्यापार खातों का प्रबंधन करें।',
    whatToDo: [
      'सर्च: कंपनी का नाम, यूज़रनेम, ईमेल, पता या शहर टाइप करके फर्म खोजें।',
      'रीसेट बटन: सर्च तुरंत साफ़ करने और सभी कंपनियां देखने के लिए रीसेट बटन (मोबाइल पर आइकन, डेस्कटॉप पर बटन) दबाएं।',
      'सक्रिय फर्म: जिस फर्म में काम करना हो उस कार्ड पर टैप करके उसे सक्रिय (Active) बनाएं।',
      'कंपनी विवरण: कंपनी का पता, फोन या विवरण एडिट करने के लिए टैप करें।',
      'नई फर्म: नई फर्म जोड़ने के लिए "+" बटन का उपयोग करें।',
    ],
    tips: 'सर्च बार के बगल में दिए रीसेट बटन से सर्च फ़िल्टर एक क्लिक में साफ़ हो जाता है।',
  },
  'ADD COMPANY': {
    title: 'नई कंपनी जोड़ने की मार्गदर्शिका',
    whatIsThis: 'अपने VyaparX खाते में नई ब्रोकरेज फर्म या कंपनी पंजीकृत करें।',
    whatToDo: [
      'फर्म का नाम, पंजीकरण नंबर और पता दर्ज करें।',
      'संपर्क नंबर और ईमेल भरें।',
      'सौदा पर्ची के लिए हेडर और फुटर टेक्स्ट सेट करें।',
      '"Save Company" पर क्लिक करें।',
    ],
    tips: 'हेडर और फुटर टेक्स्ट आपके द्वारा प्रिंट की जाने वाली हर पर्ची पर स्वतः आएगा।',
  },
  'EDIT COMPANY': {
    title: 'कंपनी विवरण सुधार मार्गदर्शिका',
    whatIsThis: 'कंपनी की जानकारी, ब्रांडिंग सेटिंग्स और बिल प्रारूप को अपडेट करें।',
    whatToDo: [
      'व्यावसायिक पता, संपर्क विवरण और टैक्स नंबर संशोधित करें।',
      'बिल का रंग और थीम कस्टमाइज़ करें।',
      '"Save Changes" पर क्लिक करें।',
    ],
    tips: 'बदलाव तुरंत आगामी सभी प्रिंट पर्चियों पर लागू हो जाएंगे।',
  },
  'CREATE YOUR FIRST COMPANY': {
    title: 'पहली कंपनी सेटअप मार्गदर्शिका',
    whatIsThis: 'VyaparX के सभी फीचर्स अनलॉक करने के लिए अपनी पहली फर्म बनाएं।',
    whatToDo: [
      'अपनी फर्म का आधिकारिक नाम और संपर्क दर्ज करें।',
      'राज्य और शहर चुनें।',
      '"Create Company" पर क्लिक करें।',
    ],
    tips: 'कंपनी बनते ही आप सौदा दर्ज करना शुरू कर सकते हैं।',
  },
  'BROKERAGE TOTAL AMOUNT REPORT': {
    title: 'दलाली रिपोर्ट मार्गदर्शिका',
    whatIsThis: 'सक्रिय वित्तीय वर्ष के पार्टी-वार दलाली आय और टर्नओवर का सारांश।',
    whatToDo: [
      'पार्टी-वार कुल व्यापार मात्रा और अर्जित दलाली की समीक्षा करें।',
      'ऊपर दाईं ओर प्रिंट आइकन से औपचारिक PDF स्टेटमेंट डाउनलोड करें।',
    ],
    tips: 'पिछले वर्षों की आय देखने के लिए प्रोफाइल से वित्तीय वर्ष बदलें।',
  },
  'MANAGE QUICK VALUES': {
    title: 'त्वरित मान (शॉर्टकट) मार्गदर्शिका',
    whatIsThis: 'डिलीवरी शर्तों और भुगतान नियमों के लिए एक-क्लिक शॉर्टकट बनाएं।',
    whatToDo: [
      'डिलीवरी की शर्तें (उदा. हाजिर डिलीवरी, 7 दिन) जोड़ें।',
      'भुगतान की शर्तें (उदा. RTGS 5 दिन, नकद) जोड़ें।',
      'श्रेणी चुनकर "+" दबाएं और शॉर्टकट सहेजें।',
    ],
    tips: 'ये शॉर्टकट सौदा बनाते समय सिंगल-टैप में चुने जा सकते हैं।',
  },
  'SECURITY & PIN': {
    title: 'सुरक्षा और पिन मार्गदर्शिका',
    whatIsThis: 'व्यापार डेटा को 4 या 6 अंकों के सुरक्षा पिन से सुरक्षित करें।',
    whatToDo: [
      'नया पिन दर्ज करें और उसकी पुष्टि करें।',
      'ऐप लॉक सक्षम करें ताकि ऐप खोलने पर पिन मांगा जाए।',
      'पिन बदलने के लिए रीसेट विकल्प का उपयोग करें।',
    ],
    tips: 'पिन लॉक से आपके ग्राहकों के भाव और कमीशन की जानकारी गोपनीय रहती है।',
  },
  'REFERRALS & REWARDS': {
    title: 'रेफर और रिवार्ड मार्गदर्शिका',
    whatIsThis: 'साथी व्यापारियों को VyaparX से जोड़ें और मुफ्त प्रीमियम एक्सेस पाएं।',
    whatToDo: [
      'अपना अनूठा रेफरल कोड WhatsApp पर साझा करें।',
      'मित्र के जुड़ने पर आप दोनों को 30 अतिरिक्त मुफ्त दिन मिलेंगे।',
    ],
    tips: 'रेफरल की कोई सीमा नहीं है — जितने चाहें उतने व्यापारियों को आमंत्रित करें।',
  },
  'MY PROFILE': {
    title: 'उपयोगकर्ता प्रोफ़ाइल मार्गदर्शिका',
    whatIsThis: 'व्यक्तिगत प्रोफ़ाइल, फर्म प्राथमिकताएं और सिस्टम सेटिंग्स।',
    whatToDo: [
      'सक्रिय कंपनी और वित्तीय वर्ष बदलें।',
      'डार्क मोड और लाइट मोड के बीच स्विच करें।',
      'ऐप की भाषा (English, हिन्दी, ગુજરાતી) बदलें।',
      'सुरक्षा पिन और त्वरित मान प्रबंधित करें।',
    ],
    tips: 'भाषा बदलने से सभी स्क्रीन और हेल्प गाइड तुरंत उस भाषा में हो जाएंगे।',
  },
};

// Gujarati Guides
const GU_GUIDES: Record<string, PageInfoGuide> = {
  'ADD PARTY': {
    title: 'નવી પાર્ટી ઉમેરવા માટેની માર્ગદર્શિકા',
    whatIsThis: 'તમારા વેપાર નેટવર્કમાં નવા ખરીદનાર (Buyer), વેચનાર (Seller) અથવા બંનેને ઉમેરવા માટેનું ફોર્મ.',
    whatToDo: [
      'પાર્ટીનો પ્રકાર પસંદ કરો: Buyer, Seller અથવા Both.',
      'ફરજિયાત વિગતો ભરો: પાર્ટીનું નામ, 10 અંકનો મોબાઈલ નંબર, રાજ્ય અને શહેર (*).',
      'વૈકલ્પિક વિગતો: સરનામું, GSTIN, PAN અને બેંક ખાતાની વિગતો ભરો.',
      'પાર્ટી સાચવો: નીચે આપેલા "Save Party" બટન પર ટેપ કરો.',
    ],
    tips: '10 અંકનો સાચો મોબાઈલ નંબર નાખો જેથી સીધા WhatsApp પર સોદાની પહોંચ મોકલી શકાય.',
  },
  'EDIT PARTY': {
    title: 'પાર્ટી વિગત સુધારવા માટેની માર્ગદર્શિકા',
    whatIsThis: 'હાલની પાર્ટીના સંપર્ક નંબર, સરનામું અથવા બેંક વિગતો અપડેટ કરવાનું પેજ.',
    whatToDo: [
      'જે વિગતો બદલવી હોય તે સુધારો (જેમ કે મોબાઈલ, શહેર, સરનામું).',
      'ફરજિયાત વિગતો (નામ, મોબાઈલ, રાજ્ય, શહેર) ખાલી ન રાખવી.',
      'જો બિનજરૂરી પાર્ટી દૂર કરવી હોય તો ઉપર જમણી બાજુના ડિલીટ આઇકનનો ઉપયોગ કરો.',
      'ફેરફારો સાચવવા "Update Party" પર ક્લિક કરો.',
    ],
    tips: 'પાર્ટી અપડેટ કરવાથી જૂના સોદાના રેકોર્ડ્સ સુરક્ષિત રહે છે.',
  },
  'PARTIES': {
    title: 'પાર્ટી યાદી માર્ગદર્શિકા',
    whatIsThis: 'તમારા તમામ રજિસ્ટર્ડ ખરીદદારો અને વેચનારાઓની સંપૂર્ણ ડિરેક્ટરી.',
    whatToDo: [
      'શોધો: સર્ચ બારમાં નામ, મોબાઈલ નંબર, શહેર, રાજ્ય, સરનામું, ઈમેલ અથવા GST નંબર લખીને કોઈપણ પાર્ટી તરત શોધો.',
      'સર્ચ રીસેટ કરો: સર્ચ ફિલ્ટર હટાવવા અને તમામ પાર્ટીઓ જોવા માટે રીસેટ બટનનો ઉપયોગ કરો.',
      'જુઓ અને સુધારો: વિગતો જોવા કે સુધારવા પાર્ટી કાર્ડ પર ટેપ કરો.',
      'સીધો ફોન: સીધો ફોન કરવા કાર્ડ પરના ફોન આઇકન પર ટેપ કરો.',
      'નવી પાર્ટી: નવી પાર્ટી ઉમેરવા નીચે જમણી બાજુના "+" બટન પર ટેપ કરો.',
    ],
    tips: 'સર્ચ હવે નામ, મોબાઈલ, શહેર, રાજ્ય, સરનામું, ઈમેલ અને GST નંબર તમામ પર કામ કરે છે.',
  },
  'ADD ITEM': {
    title: 'નવી જણસી/આઇટમ ઉમેરવા માર્ગદર્શિકા',
    whatIsThis: 'નવી કોમોડિટી પ્રોડક્ટ (જેમ કે કપાસ, કપાસિયા ખોળ, જીરું, તેલ વગેરે) ઉમેરવા માટેનું ફોર્મ.',
    whatToDo: [
      'જણસીનું નામ દાખલ કરો (દા.ત. COTTON 29MM, KAPAS SHANKAR).',
      'ડિફૉલ્ટ યુનિટ પસંદ કરો (ગાંસડી/Bales, ગુણી/Bags, ક્વિન્ટલ/Quintal, કિલો/Kg).',
      'પેકિંગ સાઈઝ અને પ્રમાણભૂત ભાવ દાખલ કરો.',
      '"Save Item" પર ક્લિક કરી પ્રોડક્ટ સાચવો.',
    ],
    tips: 'અહીં ઉમેરેલી જણસી નવો સોદો બનાવતી વખતે ડ્રોપડાઉનમાં દેખાશે.',
  },
  'EDIT ITEM': {
    title: 'જણસી વિગત સુધારવા માર્ગદર્શિકા',
    whatIsThis: 'કોમોડિટી જણસીનું નામ, પેકિંગ અથવા બજાર ભાવ બદલવા માટેનું પેજ.',
    whatToDo: [
      'જણસીનું નામ, યુનિટ અથવા ભાવ જરૂર મુજબ સુધારો.',
      'જે જણસી હવે વેપારમાં ન હોય તેને ઉપર જમણી બાજુ ડિલીટ બટનથી હટાવો.',
      '"Update Item" પર ક્લિક કરીને ફેરફાર સાચવો.',
    ],
    tips: 'યોગ્ય યુનિટ પસંદ કરો કારણ કે સોદાની સમગ્ર ગણતરી આના પર આધારિત છે.',
  },
  'ITEM DETAIL': {
    title: 'કોમોડિટી જણસી યાદી માર્ગદર્શિકા',
    whatIsThis: 'તમારી પેઢી દ્વારા વેપાર થતી તમામ જણસીઓનું કેટલોગ.',
    whatToDo: [
      'શોધો: સર્ચ બારમાં આઇટમનું નામ લખીને કોઈપણ જણસી ઝડપથી શોધો.',
      'રીસેટ બટન: સર્ચ તરત ક્લિયર કરી બધી જણસીઓ જોવા માટે રીસેટ બટન (મોબાઇલમાં આઇકન, ડેસ્કટોપમાં બટન) નો ઉપયોગ કરો.',
      'સુધારો: કોઈપણ કાર્ડ પર ટેપ કરીને ભાવ કે યુનિટ સુધારો.',
      'નવી જણસી: નવી જણસી ઉમેરવા નીચે આપેલા "+" બટન પર ટેપ કરો.',
    ],
    tips: 'સર્ચ બોક્સની બાજુમાં આપેલ રીસેટ બટનથી સર્ચ એક ક્લિકમાં ક્લિયર થઈ જશે.',
  },
  'CREATE VYAPAR ORDER': {
    title: 'વેપાર સોદો નોંધવા માટેની માર્ગદર્શિકા',
    whatIsThis: 'નવો કોમોડિટી સોદો નોંધવા માટેનું 3-સ્ટેપનું વિઝાર્ડ ફોર્મ.',
    whatToDo: [
      'સ્ટેપ 1 (જણસી અને ભાવ): જણસી, ભાવ, જથ્થો અને વજન યુનિટ પસંદ કરો.',
      'સ્ટેપ 2 (પાર્ટીઓ): વેચનાર (Seller) અને ખરીદનાર (Buyer) પસંદ કરો. બંને અલગ હોવા જોઈએ.',
      'સ્ટેપ 3 (ડિલિવરી અને શરતો): ડિલિવરીની શરતો, પેમેન્ટ મુદત અને દલાલી દર નક્કી કરો.',
      'સાચવો અને શેર કરો: સોદો સાચવીને તરત WhatsApp પર પુષ્ટિકરણ પહોંચ મોકલો.',
    ],
    tips: 'સ્ટેપ 1 અને સ્ટેપ 2 પૂર્ણ કર્યા પછી જ ડિલિવરી અને પેમેન્ટનું સ્ટેપ અનલૉક થશે.',
  },
  'EDIT VYAPAR': {
    title: 'સોદો સુધારવા માટેની માર્ગદર્શિકા',
    whatIsThis: 'અગાઉ નોંધેલા સોદાના ભાવ, જથ્થો અથવા શરતોમાં સુધારો કરો.',
    whatToDo: [
      'સોદાના વિવિધ સ્ટેપમાં જઈને જરૂરી સુધારો કરો.',
      'જો સોદો રદ કરવો હોય તો ઉપર જમણી બાજુના ડિલીટ આઇકનનો ઉપયોગ કરો.',
      '"Update Sauda" પર ક્લિક કરીને નવી પહોંચ તૈયાર કરો.',
    ],
    tips: 'કોઈપણ સુધારો નાણાકીય વર્ષના દલાલી રિપોર્ટમાં તરત જ અપડેટ થઈ જશે.',
  },
  'VYAPAR': {
    title: 'વેપાર સોદા યાદી માર્ગદર્શિકા',
    whatIsThis: 'પેઢીના તમામ ચાલુ, પૂર્ણ અને બાકી સોદાઓનું મુખ્ય ડેશબોર્ડ જેમાં મલ્ટી-ફિલ્ડ સર્ચ અને ફિલ્ટર ઉપલબ્ધ છે.',
    whatToDo: [
      'મલ્ટી-ફિલ્ડ સર્ચ: DO નંબર (#DO), જણસી આઇટમનું નામ, વેચનારનું નામ, પિકઅપ સ્થળ/શહેર, ખરીદનારનું નામ, અથવા ડ્રોપ સ્થળ/શહેરથી શોધો.',
      'ફિલ્ટર પોપઅપ: સર્ચ બારની બાજુમાં આપેલ ફિલ્ટર બટન દબાવીને તારીખ (કેલેન્ડર પીકર), જણસી LOV, અથવા પાર્ટી LOV (વેચનાર/ખરીદનાર) મુજબ ફિલ્ટર કરો.',
      'રીસેટ બટન: સર્ચ અને તમામ પોપઅપ ફિલ્ટર હટાવવા માટે રીસેટ બટન (મોબાઇલમાં આઇકન, ડેસ્કટોપમાં આઇકન + લેબલ) નો ઉપયોગ કરો.',
      'સક્રિય ફિલ્ટર્સ: સર્ચ બાર નીચે આપેલ ફિલ્ટર ટેગ પરથી કોઈપણ ફિલ્ટર સીધું હટાવી શકો છો.',
      'સોદો જુઓ અને શેર કરો: કોઈપણ કાર્ડ પર ટેપ કરી સંપૂર્ણ વિગત જુઓ અથવા WhatsApp પર PDF પહોંચ મોકલો.',
      'નવો સોદો: નવો વેપાર ઓર્ડર બનાવવા નીચે જમણી બાજુ આપેલ "+" બટન પર ટેપ કરો.',
    ],
    tips: 'સર્ચ ક્લિયર કરવા અને તમામ ફિલ્ટર એકસાથે હટાવવા રીસેટ બટન પર ક્લિક કરો.',
  },
  'VYAPAR BILLS & NOTES': {
    title: 'વેપાર બિલ અને પહોંચ માર્ગદર્શિકા',
    whatIsThis: 'પ્રિન્ટ કરી શકાય તેવી અધિકૃત વેપાર કરાર પહોંચ તૈયાર કરો જેમાં મલ્ટી-ફિલ્ડ સર્ચ અને ફિલ્ટર ઉપલબ્ધ છે.',
    whatToDo: [
      'ઓર્ડર શોધો: DO નંબર (#DO), જણસી, વેચનાર, ખરીદનાર, પિકઅપ/ડ્રોપ સ્થળ કે શહેરથી ઓર્ડર શોધો.',
      'ફિલ્ટર પોપઅપ: તારીખ (કેલેન્ડર પીકર), જણસી LOV, અથવા પાર્ટી LOV (વેચનાર/ખરીદનાર) મુજબ ફિલ્ટર કરો.',
      'રીસેટ બટન: સર્ચ અને તમામ ફિલ્ટર એક ક્લિકમાં હટાવવા રીસેટ બટન (મોબાઇલમાં આઇકન, ડેસ્કટોપમાં આઇકન + લેબલ) નો ઉપયોગ કરો.',
      'ઓર્ડર પસંદ કરો: યાદીમાંથી કોઈપણ ઓર્ડર પર ટેપ કરી તેની સોદા પહોંચ જુઓ.',
      'ટેમ્પલેટ અને રંગ: મનપસંદ ટેમ્પલેટ ડિઝાઇન (1-4) અને બ્રાન્ડિંગ રંગ પસંદ કરો.',
      'પ્રિન્ટ અથવા PDF: કાગળ પર પ્રિન્ટ કાઢો અથવા PDF ડાઉનલોડ કરી શેર કરો.',
    ],
    tips: 'સર્ચ અને ફિલ્ટર ટૂલ્સની મદદથી કોઈપણ સોદાની પ્રિન્ટ પહોંચ તરત શોધી શકાય છે.',
  },
  'COMPANIES': {
    title: 'કંપનીઓ યાદી માર્ગદર્શિકા',
    whatIsThis: 'તમારી બહુવિધ પેઢીઓ અને વેપાર ખાતાઓનું સંચાલન કરો.',
    whatToDo: [
      'શોધો: કંપનીનું નામ, યુઝરનેમ, ઈમેલ, સરનામું અથવા શહેર લખીને પેઢી શોધો.',
      'રીસેટ બટન: સર્ચ તરત ક્લિયર કરી બધી કંપનીઓ જોવા માટે રીસેટ બટન (મોબાઇલમાં આઇકન, ડેસ્કટોપમાં બટન) નો ઉપયોગ કરો.',
      'સક્રિય પેઢી: જે પેઢીમાં કામ કરવું હોય તે કાર્ડ પર ટેપ કરી સક્રિય (Active) બનાવો.',
      'પેઢીનું સરનામું: ફોન કે વિગતો સુધારવા એડિટ કરો.',
      'નવી પેઢી: નવી પેઢી ઉમેરવા "+" બટનનો ઉપયોગ કરો.',
    ],
    tips: 'સર્ચ બોક્સની બાજુમાં આપેલ રીસેટ બટનથી સર્ચ એક ક્લિકમાં ક્લિયર થઈ જશે.',
  },
  'ADD COMPANY': {
    title: 'નવી કંપની ઉમેરવા માર્ગદર્શિકા',
    whatIsThis: 'તમારા VyaparX એકાઉન્ટમાં નવી દલાલી પેઢી કે કંપની નોંધણી કરો.',
    whatToDo: [
      'પેઢીનું સત્તાવાર નામ, રજીસ્ટ્રેશન નંબર અને સરનામું ભરો.',
      'સંપર્ક નંબર અને ઈમેલ દાખલ કરો.',
      'સોદાની પહોંચ માટે હેડર અને ફૂટર લખાણ સેટ કરો.',
      '"Save Company" પર ક્લિક કરો.',
    ],
    tips: 'હેડર અને ફૂટર લખાણ પ્રિન્ટ થતી દરેક પહોંચ પર આપમેળે આવશે.',
  },
  'EDIT COMPANY': {
    title: 'કંપની વિગત સુધારવા માર્ગદર્શિકા',
    whatIsThis: 'પેઢીની માહિતી, બ્રાન્ડિંગ સેટિંગ્સ અને બિલ ફોર્મેટ અપડેટ કરો.',
    whatToDo: [
      'ધંધાનું સરનામું, સંપર્ક નંબર અને ટેક્સ નંબર સુધારો.',
      'બિલનો રંગ અને થીમ કસ્ટમાઇઝ કરો.',
      '"Save Changes" પર ક્લિક કરો.',
    ],
    tips: 'ફેરફારો તરત જ ભવિષ્યની પ્રિન્ટ પહોંચો પર લાગુ થઈ જશે.',
  },
  'CREATE YOUR FIRST COMPANY': {
    title: 'પ્રથમ કંપની સેટઅપ માર્ગદર્શિકા',
    whatIsThis: 'VyaparX શરૂ કરવા માટે તમારી પ્રથમ વેપારી પેઢી નોંધણી કરો.',
    whatToDo: [
      'તમારી પેઢીનું સત્તાવાર નામ અને સંપર્ક દાખલ કરો.',
      'રાજ્ય અને શહેર પસંદ કરો.',
      '"Create Company" પર ક્લિક કરો.',
    ],
    tips: 'કંપની બનતાં જ તમે સોદા નોંધવાનું શરૂ કરી શકો છો.',
  },
  'BROKERAGE TOTAL AMOUNT REPORT': {
    title: 'દલાલી રિપોર્ટ માર્ગદર્શિકા',
    whatIsThis: 'નાણાકીય વર્ષની પાર્ટી મુજબ દલાલી આવક અને ટર્નઓવરનો સારાંશ.',
    whatToDo: [
      'પાર્ટી મુજબ કુલ વેપાર જથ્થો અને મળેલ દલાલી તપાસો.',
      'ઉપર જમણી બાજુ પ્રિન્ટ આઇકનથી સત્તાવાર PDF સ્ટેટમેન્ટ ડાઉનલોડ કરો.',
    ],
    tips: 'અગાઉના વર્ષોની આવક જોવા પ્રોફાઇલમાંથી નાણાકીય વર્ષ બદલો.',
  },
  'MANAGE QUICK VALUES': {
    title: 'ઝડપી મૂલ્યો (શૉર્ટકટ) માર્ગદર્શિકા',
    whatIsThis: 'વારંવાર વપરાતી ડિલિવરી શરતો અને પેમેન્ટ નિયમોના શૉર્ટકટ બનાવો.',
    whatToDo: [
      'ડિલિવરી શરતો (દા.ત. હાજર ડિલિવરી, 7 દિવસ) ઉમેરો.',
      'પેમેન્ટ શરતો (દા.ત. RTGS 5 દિવસ, રોકડા) ઉમેરો.',
      'કેટેગરી પસંદ કરી "+" દબાવી શૉર્ટકટ સાચવો.',
    ],
    tips: 'આ શૉર્ટકટ્સ સોદો બનાવતી વખતે સિંગલ-ટેપમાં પસંદ કરી શકાય છે.',
  },
  'SECURITY & PIN': {
    title: 'સુરક્ષા અને પિન માર્ગદર્શિકા',
    whatIsThis: 'વેપાર ડેટાને 4 કે 6 અંકના સિક્યુરિટી પિનથી સુરક્ષિત કરો.',
    whatToDo: [
      'નવો પિન દાખલ કરો અને પુષ્ટિ કરો.',
      'એપ લૉક સક્રિય કરો જેથી એપ ખોલતાં જ પિન પૂછાય.',
      'પિન બદલવા રીસેટ વિકલ્પનો ઉપયોગ કરો.',
    ],
    tips: 'પિન લૉકથી તમારા ગ્રાહકોના ભાવ અને કમિશનની વિગતો ગુપ્ત રહે છે.',
  },
  'REFERRALS & REWARDS': {
    title: 'રેફર અને રિવૉર્ડ માર્ગદર્શિકા',
    whatIsThis: 'સાથી વેપારીઓને VyaparX ની ભલામણ કરી ફ્રી પ્રીમિયમ મેળવો.',
    whatToDo: [
      'તમારો અનોખો રેફરલ કોડ WhatsApp પર શેર કરો.',
      'મિત્ર જોડાશે ત્યારે તમારા બંનેને 30 વધારાના ફ્રી દિવસ મળશે.',
    ],
    tips: 'રેફરલની કોઈ મર્યાદા નથી — વધુ સાથીઓને આમંત્રિત કરો.',
  },
  'MY PROFILE': {
    title: 'યુઝર પ્રોફાઇલ માર્ગદર્શિકા',
    whatIsThis: 'વ્યક્તિગત પ્રોફાઇલ, પેઢી પસંદગીઓ અને સિસ્ટમ સેટિંગ્સ.',
    whatToDo: [
      'સક્રિય કંપની અને નાણાકીય વર્ષ બદલો.',
      'ડાર્ક મોડ અને લાઈટ મોડ વચ્ચે સ્વિચ કરો.',
      'એપની ભાષા (English, हिन्दी, ગુજરાતી) બદલો.',
      'સિક્યુરિટી પિન અને ઝડપી મૂલ્યો મેનેજ કરો.',
    ],
    tips: 'ભાષા બદલતાં જ તમામ સ્ક્રીન અને હેલ્પ ગાઇડ તરત જ તે ભાષામાં બદલાઈ જશે.',
  },
};

export const GUIDES_BY_LANGUAGE: Record<Language, Record<string, PageInfoGuide>> = {
  en: EN_GUIDES,
  hi: HI_GUIDES,
  gu: GU_GUIDES,
};

export function resolvePageGuide(
  title: string,
  language: Language = 'en',
  customInfo?: PageInfoGuide | string
): PageInfoGuide | null {
  if (customInfo) {
    if (typeof customInfo === 'string') {
      const ui = UI_GUIDE_STRINGS[language] || UI_GUIDE_STRINGS.en;
      return {
        title: `${title.toUpperCase()} GUIDE`,
        whatIsThis: customInfo,
        whatToDo: [language === 'en' ? 'Follow the instructions and form fields on this page.' : 'Page par diye gaye instructions aur form fields follow karein.'],
      };
    }
    return customInfo;
  }

  const cleanTitle = title.trim().toUpperCase();
  const dict = GUIDES_BY_LANGUAGE[language] || GUIDES_BY_LANGUAGE.en;
  const fallbackDict = GUIDES_BY_LANGUAGE.en;

  // 1. Exact match in current language
  if (dict[cleanTitle]) {
    return dict[cleanTitle];
  }

  // 2. StartsWith or includes match in current language
  for (const [key, guide] of Object.entries(dict)) {
    if (cleanTitle.startsWith(key) || cleanTitle.includes(key)) {
      return guide;
    }
  }

  // 3. Fallback to English exact or partial match
  if (fallbackDict[cleanTitle]) {
    return fallbackDict[cleanTitle];
  }
  for (const [key, guide] of Object.entries(fallbackDict)) {
    if (cleanTitle.startsWith(key) || cleanTitle.includes(key)) {
      return guide;
    }
  }

  // 4. Fallback generic guide in simple English
  return {
    title: `${cleanTitle} GUIDE`,
    whatIsThis: `This page allows you to view and manage records related to ${title.toLowerCase()}.`,
    whatToDo: [
      'Review the options and form fields displayed on this page.',
      'Enter the required details and save your changes.',
    ],
    tips: 'For any further assistance, use the Help & Support options in Settings.',
  };
}
