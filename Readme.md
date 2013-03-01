
# ntask

__Taskmanagement, your way!__


Ntask supports sorting and filtering of TODO-comments from your source-code
in such a way that only reg-ex elitists would be able to do in a snap.

***

### Installation

    λ npm install ntask -g


## Getting started

First you need to tell ntask to start tracking your project.

    λ t init .

Ones tracking is set up you can refresh the index by issuing `update`.
__Tip: Do atomic updates by having your editor issue the update-
command on the current file, post save.__

    λ t update .

Go ahead and issue the tracker for tasks.

    λ t find ""


## Syntax

Traditional [FIXME-comments](http://www.riedquat.de/TR/trunk/TODO_Syntax/)
are supported, however I'd recommend ntask's own syntax. The latter is not
as strict, it resembles the syntax of a tweet and it offers more granulated
searches with filtering and sorting.


### Example tasks

* OPTIMIZE #refactor like a boss
* BUG @frontend mouse-event does not bubble to the top
* REVIEW @john I believe the #lexer is ready for production  
       | I started with failing tests and ended up with 100%  
       | test-coverage. Just wanted to make sure your happy  
       | with the #benchmarks.

So what's interesting here?

Well, you can see that one might use groups as assignee, making
it well tuned to agile teams. Titles does not have to be as
thoroughly thought of, as you can place the task alongside the
actual code. And finally, you can write as in-depth as you so
please by prefixing following lines with a pipe.


### Keywords

The point of entry for ntask is finding keywords in your source-code. Ntask
supports the keywords listed below.

* TODO
* DONE
* BUG
* FIXME
* OPTIMIZE
* XXX
* REVIEW


### Assignee

Adding an assignee to a task is done using the "@"-character as prefix of a
string. Tasks without an explicitly set assignee will retrieve the assignee
"@none", also aliased to "@unassigned".


### Labels

Labels are prefixed with the "#"-character, they can be searched for,
sorted by or even filtered upon. A label can contain a scalar value by
surrounding it with brackets.
Ex: pri[2]


### Title

For a task to be added, it has to validate. A valid task has a title of at
least five characters and a keyword.

__PS.__ _Labels and assignee does not count as being part of the title as
these can shift within the lifespan of a task._



## Find

__The power of ntask´s find-command is what really makes ntask shine.__

***

### @Assignee

Prefix your name with an "@"-symbol and you'll get a list of tasks sorted
by date, that are yours.

    t find "@$(whoami)"

Tasks that are not assigned to anyone specific will land under the assignee
@none. This means you can easily manage a taskpool by just querying:

    t find "@none"

__You can also use the alias @unassigned.__

***

### Labels

Labels come in two forms. The keyword that the task was prefixed with
(TODO | OPTIMIZE | BUG | FIXME) and words starting with a hash-symbol. The
latter can also have brackets that store a scalar value. This value can be
filtered and sorted upon.

    t find "#pri[>3]*"

In the example above I have suffixed the label with an asterix, that selects
the label for sorting. This is useful in conjunction with the --reverse flag
for ascending sorts. You can also see that there's filtering being done here
using brackets, so "pri"-labels with a numeric value of less than three will
not be displayed.

***

### Options

    -f, --format [string]

    The format-string is a sprintf-like implementation of all the
    properties of a task.

    %A - Assignee
    %B - Body
    %H - Label (#hash)
    %I - Id
    %K - Keyword
    %L - Line
    %T - Title

    -r, --reverse


## Future of ntask

I'd like to make ntask compatible with other issue-trackers like github,
asana and jira. We should have some recipes for use with version control.
Like commit-message from ntask and perhaps automatic tweets upon major-
releases and such.


## Contributing

Please feel free to drop me an email with suggestions or even better, nag
me with pull-requests.

### Constributors

* Your name should be here
*	Henrik Kjelsberg <hkjels@me.com> 
[github](http://github.com/hkjels/ "Github account")
[website](http://take.no/ "Development blog")


## License

> (The MIT License)
>
> Copyright (c) 2013 Henrik Kjelsberg &lt;hkjels@me.com&gt;
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

