# Todo


__Tip: Create a taskpool similar to this one at the root of your project for rapid planning__


*	OPTIMIZE #RegEx should work with any type of #comment & #language  

*	TODO #Research how one can track hours. Tracking labels for changes like #hours[n] ?  

*	TODO #github #thub todo-github should be able to add/modify/delete issues  

*	TODO #config --global Should interact with .todoconfig in the HOME-dir and local configurations should override  

*	TODO #alias functionality from config, just like git's aliases  
	| Ex. 
	|	un = config user.name  
	|	t find @$(t un) 		# Outputs a bunch of issues for your user  

*	TODO #config for centralized #storage. Useful with large teams, ensuring that information is  
  	| available even if you do not have the project locally.  
 	| In practice : the ability to do all issue-tracker interaction with git-hooks or similar  
 	| from a bare repository  

*	TODO Closing tasks should be possible through the use of keywords (CLOSE|CLOSES|CLOSED|FIXES|FIXED)
	| or by manually removing them from the code.
	| Closed tasks should still exist in the index, but be compacted if it stays closed for a longer
	| period of time.


_Note: If you come up with other clever ways of organizing and using "todo", please tell me._