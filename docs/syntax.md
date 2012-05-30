# Comment-syntax

You can use traditional TODO-comments in the strict format of the
[specification](http://www.riedquat.de/TR/trunk/TODO_Syntax/) or the new
twitter-styled comments of __ntask__. I highly recommend the latter, as
it offers a lot more functionality.


### ntask looks for these keywords

* TODO
* BUG
* FIXME
* OPTIMIZE
* XXX
* REVIEW
* DONE

_Keywords should be in uppercase_


### Title

For a task to be added, it has to validate. A valid task has a title of atleast
ten characters and a keyword ofcourse.

_Labels and assignee does not count as being part of the title_


### Assignee

Tasks without an explicitly set assignee will retrieve the assignee "@none".
Adding an assignee is done using the "@"-character as prefix of a string.

_@unassigned is an alias to @none_


### Labels

Labels are prefixed with the "#"-character and can be filtered and searched.
A label can contain a scalar value by surrounding it with brackets.
Ex: pri[2]
