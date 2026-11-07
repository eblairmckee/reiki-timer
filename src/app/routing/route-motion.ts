/** Keep ordinary route animation. During an existing native snapshot animation,
 * commit the latest navigation without starting a second, competing snapshot.
 * Router calls this only in browsers supporting view-transition type selectors.
 */
export function routeTransitionTypes(): string[] | false {
  return document.documentElement.matches(":active-view-transition") ? false : ["navigation"];
}
