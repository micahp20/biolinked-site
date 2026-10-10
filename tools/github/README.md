# supabase-keepalive.yml — needs to be installed by hand

This workflow keeps the Supabase project from pausing. It could not be
committed to `.github/workflows/` from here: the token in use lacks
GitHub's `workflow` scope, so a push that creates or edits a workflow
file is refused.

To install it, either:

* copy `supabase-keepalive.yml` to `.github/workflows/supabase-keepalive.yml`
  and push with your own credentials, or
* add it through the GitHub web UI: **Actions → New workflow → set up a
  workflow yourself**, paste the file, commit.

Then open **Actions → supabase-keepalive → Run workflow** once to confirm
it passes. It needs no repository secret: the key in it is the project's
public anon key, the same one already served in the protocol pages.

The ping itself is already verified working — calling `get_state` for an
unknown slug returns HTTP 200 and an empty array, writing nothing.
