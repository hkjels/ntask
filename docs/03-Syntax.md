
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


