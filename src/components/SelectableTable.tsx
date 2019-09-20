import React, { FunctionComponent, useState, useEffect } from "react";
import {
  Checkbox,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";

export type AlignType = "inherit" | "left" | "center" | "right" | "justify"
export type KeyType = string;
export interface HeaderConfigType {
  order: string[];
  config: {
    [key: string]: {
      text: string;
      align: AlignType;
    };
  };
}
interface BodyType {
  id: KeyType;
  [key: string]: any;
}

export interface SelectableTableProps {
  headers: HeaderConfigType;
  showHeaders?: boolean;
  body: BodyType[];
  selectable: boolean;
  onSelect?: (ids: KeyType[]) => void;
}

interface SelectableTableRowProps {
  key: KeyType;
  selectable: boolean;
  selected: boolean;
  cell: BodyType;
  headers: HeaderConfigType;
  onSelect: (id: KeyType) => void;
}

const SelectableTableRow: FunctionComponent<SelectableTableRowProps> = (props) => (
  <TableRow>
    {props.selectable && <TableCell padding="checkbox">
                           <Checkbox onClick={() => props.onSelect(props.cell.id)} checked={props.selected} />
                         </TableCell>}
    {props.headers.order.map(header => <TableCell
                                         key={`${header}-${props.cell.id}`}
                                         align={props.headers.config[header].align}>
                                           {props.cell[header]}
                                       </TableCell>)}
  </TableRow>
);

export const SelectableTable: FunctionComponent<SelectableTableProps> = (props) => {
  const [selectedKeys, setSelectedKeys] = useState<KeyType[]>([]);
  const selectCell = (key: KeyType) => {
    let updatedSelectedKeys: KeyType[];

    if (selectedKeys.includes(key)) {
      updatedSelectedKeys = selectedKeys.filter(selectedKey => selectedKey !== key);
    } else {
      updatedSelectedKeys = [...selectedKeys, key];
    }

    setSelectedKeys(updatedSelectedKeys);
    props.onSelect(updatedSelectedKeys);
  };

  useEffect(() => {
    setSelectedKeys([]);
  }, [props.body]);

  return (
    <Table size="small">
      {(props.showHeaders === undefined ? true : props.showHeaders) &&
        <TableHead>
          <TableRow>
            {props.selectable && <TableCell padding="checkbox" />}
            {props.headers.order.map(header => <TableCell
                                                 align={props.headers.config[header].align}
                                                 key={header}
                                               >
                                                 {props.headers.config[header].text}
                                               </TableCell>)}
          </TableRow>
        </TableHead>
      }
      <TableBody>
        {props.body.map(body => <SelectableTableRow
                                   cell={body}
                                   selectable={props.selectable}
                                   selected={selectedKeys.includes(body.id)}
                                   key={body.id}
                                   headers={props.headers}
                                   onSelect={selectCell}
                                 />
        )}
      </TableBody>
    </Table>
  );
};
