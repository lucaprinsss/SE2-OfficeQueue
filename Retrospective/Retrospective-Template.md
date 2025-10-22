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
- Integration Tests passing
- Code present on VCS
- Code review completed
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

$$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = 0.04 $$

#### Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

$$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_{task_i}}-1 \right| = 0.06 $$
  
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
    

## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated = 8h
  - Total hours spent = 8.5h
  - Nr of automated unit test cases = 77 tests
  - Coverage = Functions: 94.11% , Branches: 82.9%
  
- Integration Testing:
  - Total hours estimated = 8h
  - Total hours spent = 8h
  - Nr of automated integration test cases = 46 tests
  - Coverage = Functions: 97.05% , Branches: 87.2%

We did not do E2E testing, we focus on unit and integration testing.
- E2E testing:
  - Total hours estimated
  - Total hours spent
  - Nr of test cases

- Code review 
  - Total hours estimated = 12h
  - Total hours spent = 10h

## ASSESSMENT

- What did go wrong in the sprint?

  - We underestimated the time required for sprint planning, leaving us with unresolved questions about several tasks even after the session.

  - Insufficient communication and coordination among team members made it challenging to integrate different parts of the project effectively.

  - Technical difficulties with Git workflow management slowed our progress and led to confusion.

  - We do not write End-To-End tests, we only focused on unit and integration testing.

- What caused your errors in estimation (if any)?

  - Limited experience with Agile methodology, particularly in task estimation, resulted in inaccurate predictions of time and effort.

  - We did not adopt established Git processes and conventions from the outset, which contributed to estimation errors.

- What lessons did you learn (both positive and negative) in this sprint?

  - Delivering simple, functional features is more valuable than attempting complex ones that risk missing deadlines or stakeholder needs.

  - Good planning and clear communication within the team lead to greater efficiency.

  - Seeking help from teammates when facing difficulties improves problem-solving and team cohesion.

  - Adopting and following established processes and conventions from the start makes the project run more smoothly and efficiently.

- Which improvement goals set in the previous retrospective were you able to achieve? 
  
  As this is our first retrospective, there were no previous improvement goals to achieve.

- Which ones you were not able to achieve? Why?
  
  As this is our first retrospective, there were no previous improvement goals that could not be achieved.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  - Be more precise in dividing and defining tasks during sprint planning, including splitting large tasks into smaller, manageable ones.

  - Allocate more time to discuss and decide on technical aspects, such as API design and implementation.

  - Enhance team communication and coordination, especially through in-person interactions.

  - Establish and consistently follow a Git workflow, paying close attention to branch management and keeping branches up to date.

  - Respect the DoD, by including E2E testing in our sprint.

- One thing you are proud of as a Team!!

  - We are proud of our ability to adapt and learn quickly from experience and of our humility in focusing on two tasks and completing both with high quality.
