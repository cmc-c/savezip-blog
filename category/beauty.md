---
layout: default
title: 뷰티
permalink: /category/beauty/
category_slug: beauty
---

<h1 class="cp-h" style="font-size:22px">뷰티</h1>

{%- assign posts = site.posts | where: "category_slug", "beauty" -%}
{%- if posts.size > 0 -%}
<ul class="post-list">
  {%- for post in posts -%}
  <li>
    <span class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</span>
    <h3><a class="post-link" href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    {%- if post.description -%}<p>{{ post.description }}</p>{%- endif -%}
  </li>
  {%- endfor -%}
</ul>
{%- else -%}
<p>아직 이 카테고리의 글이 없습니다.</p>
{%- endif -%}

{% include coupang-widget.html slot="bottom_banner" %}
