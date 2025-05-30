/**
 * Change event object that is emitted when the user selects a
 * different page size or navigates to another page.
 */
export class PageEvent {
    /** The current page index. */
    pageIndex;
    /**
     * Index of the page that was selected previously.
     * @breaking-change 8.0.0 To be made into a required property.
     */
    previousPageIndex;
    /** The current page size. */
    pageSize;
    /** The current total number of items being paged. */
    length;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGlicy9wYWdpbmF0b3Ivc3JjL2xpYi9pbnRlcmZhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLFNBQVM7SUFDcEIsOEJBQThCO0lBQzlCLFNBQVMsQ0FBUztJQUVsQjs7O09BR0c7SUFDSCxpQkFBaUIsQ0FBVTtJQUUzQiw2QkFBNkI7SUFDN0IsUUFBUSxDQUFTO0lBRWpCLHFEQUFxRDtJQUNyRCxNQUFNLENBQVU7Q0FDakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENoYW5nZSBldmVudCBvYmplY3QgdGhhdCBpcyBlbWl0dGVkIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhXG4gKiBkaWZmZXJlbnQgcGFnZSBzaXplIG9yIG5hdmlnYXRlcyB0byBhbm90aGVyIHBhZ2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYWdlRXZlbnQge1xuICAvKiogVGhlIGN1cnJlbnQgcGFnZSBpbmRleC4gKi9cbiAgcGFnZUluZGV4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEluZGV4IG9mIHRoZSBwYWdlIHRoYXQgd2FzIHNlbGVjdGVkIHByZXZpb3VzbHkuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOC4wLjAgVG8gYmUgbWFkZSBpbnRvIGEgcmVxdWlyZWQgcHJvcGVydHkuXG4gICAqL1xuICBwcmV2aW91c1BhZ2VJbmRleD86IG51bWJlcjtcblxuICAvKiogVGhlIGN1cnJlbnQgcGFnZSBzaXplLiAqL1xuICBwYWdlU2l6ZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgY3VycmVudCB0b3RhbCBudW1iZXIgb2YgaXRlbXMgYmVpbmcgcGFnZWQuICovXG4gIGxlbmd0aD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYWdlciB7XG4gIC8qKiBUaGUgY3VycmVudCBwYWdlIGluZGV4ICovXG4gIG51bWJlcjogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbGFiZWwgZm9yIHRoZSBwYWdlICovXG4gIHRleHQ6IHN0cmluZztcbn1cblxuLy8gTm90ZSB0aGF0IHdoaWxlIGBQYWdpbmF0b3JEZWZhdWx0T3B0aW9uc2AgYW5kIGBQQUdJTkFUT1JfREVGQVVMVF9PUFRJT05TYCBhcmUgaWRlbnRpY2FsXG4vLyBiZXR3ZWVuIHRoZSBNREMgYW5kIG5vbi1NREMgdmVyc2lvbnMsIHdlIGhhdmUgdG8gZHVwbGljYXRlIHRoZW0sIGJlY2F1c2UgdGhlIHR5cGUgb2Zcbi8vIGBmb3JtRmllbGRBcHBlYXJhbmNlYCBpcyBuYXJyb3dlciBpbiB0aGUgTURDIHZlcnNpb24uXG5cbi8qKiBPYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHBhZ2luYXRvciBtb2R1bGUuICovXG5leHBvcnQgaW50ZXJmYWNlIFBhZ2luYXRvckRlZmF1bHRPcHRpb25zIHtcbiAgLyoqIE51bWJlciBvZiBpdGVtcyB0byBkaXNwbGF5IG9uIGEgcGFnZS4gQnkgZGVmYXVsdCBzZXQgdG8gNTAuICovXG4gIHBhZ2VTaXplPzogbnVtYmVyO1xuXG4gIC8qKiBUaGUgc2V0IG9mIHByb3ZpZGVkIHBhZ2Ugc2l6ZSBvcHRpb25zIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXIuICovXG4gIHBhZ2VTaXplT3B0aW9ucz86IG51bWJlcltdO1xuXG4gIC8qKiBXaGV0aGVyIHRvIGhpZGUgdGhlIHBhZ2Ugc2l6ZSBzZWxlY3Rpb24gVUkgZnJvbSB0aGUgdXNlci4gKi9cbiAgaGlkZVBhZ2VTaXplPzogYm9vbGVhbjtcblxuICAvKiogV2hldGhlciB0byBzaG93IHRoZSBmaXJzdC9sYXN0IGJ1dHRvbnMgVUkgdG8gdGhlIHVzZXIuICovXG4gIHNob3dGaXJzdExhc3RCdXR0b25zPzogYm9vbGVhbjtcbn1cbiJdfQ==