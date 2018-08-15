# Camera Luminance Adaptation

Implementation of [^1].

Basic algorithm is:

1. Compute immediate brightness histogram each frame (using Compute Shaders)
2. Perform a running integral of the HDR histogram using the LDR bracket
3. Keep the index where we reach the maximum (this indicates where we perceive the most details)
4. Adapt luminance to fit this range


## References

[^1]: [Schulz. 2007 "Using Brightness Histogram to perform Optimum Auto Exposure"](https://www.semanticscholar.org/paper/Using-Brightness-Histogram-to-perform-Optimum-Auto-Schulz/1eee54692098cbb06c3822ae4fd84d54924e3107)
