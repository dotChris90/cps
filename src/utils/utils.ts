export class Utils {

    public static notIn<T>(set1 : Set<T>, set2 : Set<T>) {
        const returnSet = new Set<T>();
        set1.forEach(e => {
            if (!set2.has(e)) {
                returnSet.add(e);
            }
        })
        return returnSet;
    }

}