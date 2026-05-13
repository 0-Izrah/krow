export function getYoutubeEmbedUrl(url) {
    if(!url) return null;

    try{
        const urlObj = new URL(url);
        let videoId = null;

        if(urlObj.hostname === 'youtu.be'){
            videoId = urlObj.pathname.slice(1);
        }else if(urlObj.hostname.includes('youtube.com')){
            videoId = urlObj.searchParams.get('v');

            if(!videoId && urlObj.pathname.includes('/shorts/')){
                videoId= urlObj.pathname.split('/shorts/')[1];
            }
        }
        if(!videoId) return null;
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }catch{
        return null;
    }
}

export function isValidYoutubeUrl(url) {
    return !!getYoutubeEmbedUrl(url);
}