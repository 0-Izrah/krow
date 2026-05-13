export function calculateStreak(logs){
    if(!logs || logs.length === 0) return 0;

    const logDates = [...new Set(logs.map(log => new Date(log.date).toDateString()))].map(d=>new Date(d)).sort((a,b)=>b-a);

    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecent = logDates[0];
    if(mostRecent < yesterday) return 0;

    let checkdate = mostRecent;
    for(let i=0; i<logDates.length; i++){
        const logDate = logDates[i];
        const diff = (checkdate - logDate) / (1000 * 60 * 60 * 24);
        if(diff <= 1){
            streak++;
            checkdate = logDate
        }else{
            break;
        }
    }
    return streak;
}