# ntask

__Taskmanagement, your way!__


Ntask supports sorting and filtering of task-comments from your sourcecode in
such a way that only regex elitists would be able to do in a snap.
_The end-goal is for Ntask to be able to track all closed tasks aswell and give
you statistics of time-used and such, ack or grep can´t help you there._


***


### Installation

    λ npm install ntask -g


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


### Contributing

Ntask could really use a few more developers that knows a thing or two about
search, statistics and issue-trackers in general. Please feel free to contact
me or nag me with pull-requests.


***


### Contributors

* Henrik Kjelsberg [github](http://github.com/hkjels/)
