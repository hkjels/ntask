# Todo

__Taskmanagement, your way!__


For decades people have put todo's into their sourcecode, but usually they get
left behind and forgotten about. Todo not only shines new light on these old
bits, but it makes it easy to manage them and use them as real issue-tracking.


***


### Usage: t [options] [command]

#### Commands:

    init [path]

    update [path]

    find <query>

    gui [path] [port]

#### Options:

    -h, --help         output usage information
    -v, --version      output the version number
    -l, --limit <n>    Limit the results output
    -r, --reverse      Reverse the sort-order
    -c, --count        Supress normal output. Output number of tasks instead

    -b, --body         Output the body of each task
    -i, --id           Ouput the id of each task

    -N, --no-line      Supress output of line-numbers.
    -H, --no-filename  Supress output of filenames.
    -C, --no-color     Prevent colored output
    -G, --no-group     Prevent grouping by filename

    -q, --quiet        Will run without output


***


### Companion apps

* [t.vim](http://github.com/hkjels/t.vim/) - Use "T" directly from within vim


***


### Contributors

* Henrik Kjelsberg [github](http://github.com/hkjels/)
