TEMPLATE FOR RETROSPECTIVE (Team 10)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed: 2 vs. done: 2
- Total points committed: 4 vs. done: 4
- Nr of hours planned: 61h vs. spent (as a team): 63h 30m

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _Uncategorized_   |     4    |       |     17h       |    21h          |
| Story 1     |    9     |    3    |   22h         |        21h      |  
| Story 2     |    9     |    1    |   22h         |        21h 30m      |  

> Story `Uncategorized` is for technical tasks, as a consequence story points are left out (not applicable in this case).

#### Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation |  2.77    |   2.46    | 
| Actual     |   2.89   |   3.32   |

The formulas used are:

$$\text{Mean }(\mu)=\frac{1}{n}\sum_{i=1}^n x_i$$

$$\text{Sample standard deviation }(s)=\sqrt{\frac{1}{n-1}\sum_{i=1}^n (x_i-\mu)^2}$$

#### Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

$$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = $$

Details for story one:
- OQ-11 2h done + 2h estimated;
- OQ-13 2h done + 2h estimated;
- OQ-12 2h done + 2h estimated;
- OQ-28 2h done + 2h estimated;
- OQ-14 2h done + 2h estimated;
- OQ-15 2h done + 2h estimated;
- OQ-22 2h done + 2h estimated;
- OQ-25 2h done + 2h estimated;
- OQ-26 5h done + 6h estimated.

Details for story two:
- OQ-19 2h done + 2h estimated;
- OQ-17 2h done + 2h estimated;
- OQ-23 2h done + 2h estimated;
- OQ-21 2h done + 2h estimated;
- OQ-24 2h done + 2h estimated;
- OQ-29 2h done + 2h estimated;
- OQ-18 2h done + 2h estimated;
- OQ-20 2h 30min done + 2h estimated;
- OQ-27 5h done + 6h estimated.

Details for uncategorized tasks:
- OQ-10 3h done + 4h estimated;
- OQ-8 30min done + 30min estimated;
- OQ-9 30min done + 30min estimated;
- OQ-16 2d 1h done + 1d 4h estimated.
    
#### Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

$$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated
  - Total hours spent
  - Nr of automated unit test cases 
  - Coverage
- E2E testing:
  - Total hours estimated
  - Total hours spent
  - Nr of test cases
- Code review 
  - Total hours estimated 
  - Total hours spent
  


## ASSESSMENT

- What did go wrong in the sprint?
  > We under estimated the sprint planning

- What caused your errors in estimation (if any)?
  > Our limited experience in Agile approach

- What lessons did you learn (both positive and negative) in this sprint?
  >
- Which improvement goals set in the previous retrospective were you able to achieve? 
  > Since this is the first retrospective, there hasn't been a previous one 
- Which ones you were not able to achieve? Why?
  >
- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Being more precise in dividing all the tasks and sprin planning.

- One thing you are proud of as a Team!!
  >