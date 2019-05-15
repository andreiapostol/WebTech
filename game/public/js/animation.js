export function generateAnimationFromFrames(frames, rate){
    return function resolve(distance){
        return frames[Math.floor(distance / rate) % frames.length]
    }
}
