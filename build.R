# Build the OS DataMercs Distill site (run from the project root, e.g. in RStudio).
# Distill lists a post only after that post's own .html exists in _posts/, so knit the posts first.
# Needs: rmarkdown, distill, knitr  (install.packages(c("rmarkdown", "distill")))
for (f in list.files("_posts", "\\.Rmd$", recursive = TRUE, full.names = TRUE)) {
  rmarkdown::render(f, quiet = TRUE, encoding = "UTF-8")
}
rmarkdown::render_site(encoding = "UTF-8")
