class Algorithms {
    /**
     * Bubble Sort
     * Time: O(n²)
     * Space: O(1)
     */
    static bubbleSort(arr) {
        let n = arr.length;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
            }
        }
        return arr;
    }

    /**
     * Merge Sort
     * Time: O(n log n)
     * Space: O(n)
     */
    static mergeSort(arr) {
        if (arr.length <= 1) return arr;

        const mid = Math.floor(arr.length / 2);
        const left = Algorithms.mergeSort(arr.slice(0, mid));
        const right = Algorithms.mergeSort(arr.slice(mid));

        return Algorithms._merge(left, right);
    }

    static _merge(left, right) {
        let result = [], i = 0, j = 0;

        while (i < left.length && j < right.length) {
            if (left[i] < right[j]) result.push(left[i++]);
            else result.push(right[j++]);
        }

        return result.concat(left.slice(i)).concat(right.slice(j));
    }

    /**
     * Linear Search
     * Time: O(n)
     * Space: O(1)
     */
    static linearSearch(arr, target) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === target) return i;
        }
        return -1;
    }

    /**
     * Binary Search
     * Time: O(log n)
     * Space: O(1)
     */
    static binarySearch(arr, target) {
        let left = 0;
        let right = arr.length - 1;

        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            if (arr[mid] === target) return mid;
            else if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    /**
     * Fibonacci (Recursive)
     * Time: O(2ⁿ)
     * Space: O(n)
     */
    static fibonacciRecursive(n) {
        if (n <= 1) return n;
        return Algorithms.fibonacciRecursive(n - 1) + Algorithms.fibonacciRecursive(n - 2);
    }

    /**
     * Fibonacci (Dynamic Programming)
     * Time: O(n)
     * Space: O(n)
     */
    static fibonacciDP(n) {
        if (n <= 1) return n;
        let dp = new Array(n + 1);
        dp[0] = 0;
        dp[1] = 1;
        for (let i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }
}
