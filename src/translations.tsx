const translations : any = {
    CATEGORY_UPDATES: "Benachrichtigungen",
    'category:updates': "Benachrichtigungen",
    CATEGORY_PERSONAL: "Persönlich",
    'category:personal': "Persönlich",
    CATEGORY_SOCIAL: "Soziale Medien",
    'category:social': "Soziale Medien",
    CATEGORY_FORUMS: "Foren",
    'category:forums': "Foren",
    CATEGORY_PROMOTIONS: "Werbung",
    'category:promotions': "Werbung",
    'category:reservations': "Reisen",
    'category:purchases': "Käufe",
    INBOX: "Posteingang",
    DRAFT: "Entwürfe",
    CHAT: "Chats",
    IMPORTANT: "Wichtig"
}

export default function translate(labelName: string) {
    if (translations[labelName])
        return translations[labelName]
    return labelName
}