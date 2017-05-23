
Water Valve Chart (WVC) visualizes logical relationships, and is capable of representing very complex sets of logical statements pictorially.  The flow starts at one side and progresses across. The flow could also start at the top and progress downward.



This example illustrates the statement `A AND B`. Using the analogy of water and gates/locks, both A and B must be open (true) in order for the water to flow through. If you keep this water analogy in mind, even the complex graphs are much easier to understand than the same logic represented in more traditional text based methods.
![](./demo-1.svg?raw=true)



This example illustrates the statement `A OR B`. Coming into the block, the "water" splits to flow to both the A and B gates. If either A or B is open (true), then the "water" will flow to the other side of the graph.
![](./demo-2.svg?raw=true)



Getting progressively more complex, this graph represents `(A OR (B AND C))` . The flow can either go through A to reach the other side of the graph, or both B and C need to be open in order for the flow to take that route.
![](./demo-3.svg?raw=true)


Continuing, this represents `(A OR B OR (C AND D AND E))` .
![](./demo-4.svg?raw=true)



This shows the same graph as above, with the execution path highlighted.
![](./demo-5.svg?raw=true)



Multiple blocks/groups can be joined together as well, to better represent distinct objects you may be working with:

`A AND (B AND (M OR N) AND Z) AND (E OR (P AND Q) OR S) AND F AND (G OR H OR I)`

![](./demo-6.svg?raw=true)



It is also possible to display evaluation results for each of the nodes, whether each was true or false. The WVC code does not inherently do this, because its job is to calculate the layout data, not how to display it. With the code you are writing that uses the WVC data, you can easily create a display as shown below, using whatever shapes and styles are appropriate for your display.

`A AND (B AND (M OR N) AND Z) AND (E OR (P AND Q) OR S) AND F AND (G OR H OR I)`

![](./demo-7.svg?raw=true)


## Input Data Structure

So, what is the data structure required as input to create these graphs? The structure is a series of arrays, with an array representing a 'group' of items. The first element of every array must be the operator 'and' or 'or' and all of the items in the array will be connected using that operator. One of the array elements can itself be an array, with the same requirement of having the group operator as the first element. Of course some combinations of comparisons are non-sensical and it is left up to the developer to use meaningful structures. The component does not perform any 'sanity' checking of the input data.

The outermost array will define the visual groupings. Each element will be treated as an independent group logically and visually.

The data shown in these examples use simple alpha-numeric characters as the elements. But you can use any custom object structure that you wish, and that entire object will be carried through and exposed in the calculated data. This would be a necessity in the real world, especially to allow users to interact meaningfully with the graph objects.

There are a few quirks currently. For the outermost array, you should always use "and" as the operator.

For the statement (A AND B) , the input data structure would be
`
[
   "and",
   [
      "and",
      "A",
      "B"
   ]
]
`

For the statement (A OR B) , the input data structure would be
`
[
   "and",
   [
      "or",
      "A",
      "B"
   ]
]
`

For the statement (A OR B OR (C AND D AND E)) , the input data structure would be
`
[
   "and",
   [
      "or",
      "A",
      "B",
      [
         "and",
         "C",
         "D",
         "E"
      ]
   ]
]
`

To create diagram xxxx, the following data is used as input:
`
[
   "and",
   [
      "or",
      {
         "id": 1,
         "label": "Rule 1",
         "ruleResult": true
      },
      {
         "id": 2,
         "label": "Rule 2",
         "ruleResult": true
      },
      [
         "and",
         {
            "id": 3,
            "label": "Rule 3",
            "ruleResult": false
         },
         {
            "id": 4,
            "label": "Rule 4",
            "ruleResult": false
         },
         {
            "id": 5,
            "label": "Rule 5",
            "ruleResult": false
         }
      ]
   ]
]
`

In addition to the simple characters used in these examples, you could use any type of object with any combination of fields, etc. that you wish for each element. The structure below shows an expanded structure of the above data.

## Vertical Orientation

The graph can also be oriented vertically, with a simple configuration setting, such that the first node is at the top and the flow goes downward.

![](./demo-8.svg?raw=true)


## Alternate Node Rendering

This illustrates that the nodes can be anything you wish. The WVC calculatest the coordinates of the various entities and you can tailor your d3js code to render those coordinates in many different ways.

![](./demo-9.svg?raw=true)
